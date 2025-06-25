import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin, logAction } from '../middleware/auth';
import { validate, createStationSchema, updateStationSchema } from '../middleware/validation';
import { createLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// GET /api/stations - Public endpoint
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      type, 
      isActive = 'true',
      page = '1', 
      limit = '50',
      search 
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (type) where.type = type;
    if (isActive) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [stations, total] = await Promise.all([
      prisma.policeStation.findMany({
        where,
        skip: offset,
        take: parseInt(limit as string),
        orderBy: [
          { type: 'asc' }, // Präsidien first
          { city: 'asc' },
          { name: 'asc' },
        ],
      }),
      prisma.policeStation.count({ where }),
    ]);

    res.json({
      stations,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Stationen' });
  }
});

// GET /api/stations/:id - Public endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const station = await prisma.policeStation.findUnique({
      where: { id },
    });

    if (!station) {
      return res.status(404).json({ error: 'Station nicht gefunden' });
    }

    res.json(station);
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Station' });
  }
});

// POST /api/stations - Admin only
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  createLimiter,
  validate(createStationSchema),
  logAction('create', 'station'),
  async (req, res) => {
    try {
      const stationData = req.body;

      const station = await prisma.policeStation.create({
        data: stationData,
      });

      res.status(201).json({
        message: 'Station erfolgreich erstellt',
        station,
      });
    } catch (error) {
      console.error('Create station error:', error);
      res.status(500).json({ error: 'Fehler beim Erstellen der Station' });
    }
  }
);

// PUT /api/stations/:id - Admin only
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  validate(updateStationSchema),
  logAction('update', 'station'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if station exists
      const existingStation = await prisma.policeStation.findUnique({
        where: { id },
      });

      if (!existingStation) {
        return res.status(404).json({ error: 'Station nicht gefunden' });
      }

      const station = await prisma.policeStation.update({
        where: { id },
        data: updateData,
      });

      res.json({
        message: 'Station erfolgreich aktualisiert',
        station,
      });
    } catch (error) {
      console.error('Update station error:', error);
      res.status(500).json({ error: 'Fehler beim Aktualisieren der Station' });
    }
  }
);

// DELETE /api/stations/:id - Admin only (Soft delete)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  logAction('delete', 'station'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if station exists
      const existingStation = await prisma.policeStation.findUnique({
        where: { id },
      });

      if (!existingStation) {
        return res.status(404).json({ error: 'Station nicht gefunden' });
      }

      // Soft delete - mark as inactive
      const station = await prisma.policeStation.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        message: 'Station erfolgreich deaktiviert',
        station,
      });
    } catch (error) {
      console.error('Delete station error:', error);
      res.status(500).json({ error: 'Fehler beim Löschen der Station' });
    }
  }
);

// POST /api/stations/bulk-import - Admin only
router.post('/bulk-import', 
  authenticateToken, 
  requireAdmin,
  logAction('bulk-import', 'station'),
  async (req, res) => {
    try {
      const { stations } = req.body;

      if (!Array.isArray(stations) || stations.length === 0) {
        return res.status(400).json({ error: 'Stations-Array ist erforderlich' });
      }

      // Validate each station
      const validatedStations = [];
      const errors = [];

      for (let i = 0; i < stations.length; i++) {
        try {
          const validated = createStationSchema.parse(stations[i]);
          validatedStations.push(validated);
        } catch (error) {
          errors.push({ index: i, error: 'Validierungsfehler', details: error });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validierungsfehler bei Import',
          errors,
        });
      }

      // Bulk create
      const result = await prisma.policeStation.createMany({
        data: validatedStations,
        skipDuplicates: true,
      });

      res.status(201).json({
        message: `${result.count} Stationen erfolgreich importiert`,
        imported: result.count,
        total: stations.length,
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({ error: 'Fehler beim Bulk-Import' });
    }
  }
);

// GET /api/stations/stats - Admin only
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalStations,
      activeStations,
      praesidien,
      reviere,
      emergencyStations,
    ] = await Promise.all([
      prisma.policeStation.count(),
      prisma.policeStation.count({ where: { isActive: true } }),
      prisma.policeStation.count({ where: { type: 'präsidium' } }),
      prisma.policeStation.count({ where: { type: 'revier' } }),
      prisma.policeStation.count({ where: { isEmergency: true } }),
    ]);

    const citiesWithStations = await prisma.policeStation.groupBy({
      by: ['city'],
      _count: { city: true },
      where: { isActive: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });

    res.json({
      totalStations,
      activeStations,
      inactiveStations: totalStations - activeStations,
      praesidien,
      reviere,
      emergencyStations,
      topCities: citiesWithStations.map(city => ({
        city: city.city,
        count: city._count.city,
      })),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});

export default router;
