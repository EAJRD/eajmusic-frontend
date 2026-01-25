import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eajmusic.com' },
    update: {},
    create: {
      email: 'admin@eajmusic.com',
      passwordHash: adminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=2563eb&color=fff',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create demo artist
  const artistPassword = await bcrypt.hash('artist123', 12);
  const artist = await prisma.user.upsert({
    where: { email: 'artist@eajmusic.com' },
    update: {},
    create: {
      email: 'artist@eajmusic.com',
      passwordHash: artistPassword,
      name: 'Cyber Dreamer',
      role: 'ARTIST',
      status: 'ACTIVE',
      emailVerified: true,
      avatarUrl: 'https://ui-avatars.com/api/?name=Cyber+Dreamer&background=8b5cf6&color=fff',
    },
  });
  console.log('Created artist user:', artist.email);

  // Create subscriptions
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: 'ENTERPRISE',
      commissionRate: 0,
      maxArtistProfiles: 999,
      isActive: true,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: artist.id },
    update: {},
    create: {
      userId: artist.id,
      plan: 'PRO',
      pricePaid: 19.99,
      commissionRate: 0,
      maxArtistProfiles: 5,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  });

  // Create artist profile
  const artistProfile = await prisma.artistProfile.upsert({
    where: { id: 'profile-cyber-dreamer' },
    update: {},
    create: {
      id: 'profile-cyber-dreamer',
      userId: artist.id,
      name: 'Cyber Dreamer',
      bio: 'Electronic music producer from the future.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Cyber+Dreamer&background=8b5cf6&color=fff',
      isVerified: true,
      verifiedAt: new Date(),
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/example',
        instagram: '@cyberdreamer',
      },
    },
  });

  // Create wallet for artist
  await prisma.wallet.upsert({
    where: { userId: artist.id },
    update: {},
    create: {
      userId: artist.id,
      availableBalance: 3240.50,
      pendingBalance: 450.25,
      lifetimeEarnings: 8750.00,
    },
  });

  // Create DSPs
  const dsps = [
    { code: 'spotify', name: 'Spotify', ratePerStream: 0.003 },
    { code: 'apple_music', name: 'Apple Music', ratePerStream: 0.007 },
    { code: 'amazon_music', name: 'Amazon Music', ratePerStream: 0.004 },
    { code: 'youtube_music', name: 'YouTube Music', ratePerStream: 0.002 },
    { code: 'deezer', name: 'Deezer', ratePerStream: 0.0035 },
    { code: 'tidal', name: 'Tidal', ratePerStream: 0.012 },
  ];

  for (const dsp of dsps) {
    await prisma.dSP.upsert({
      where: { code: dsp.code },
      update: {},
      create: dsp,
    });
  }
  console.log('Created DSPs');

  // Create sample releases
  const release1 = await prisma.release.create({
    data: {
      userId: artist.id,
      artistProfileId: artistProfile.id,
      title: 'Neon Nights',
      releaseType: 'SINGLE',
      genre: 'Electronic',
      subgenre: 'Synthwave',
      language: 'EN',
      releaseDate: new Date('2023-10-15'),
      status: 'LIVE',
      isExplicit: false,
      cLineYear: 2023,
      cLineText: 'Cyber Dreamer',
      pLineYear: 2023,
      pLineText: 'Cyber Dreamer',
      coverArtUrl: 'https://picsum.photos/500/500?random=1',
      approvedAt: new Date('2023-10-10'),
      submittedAt: new Date('2023-10-01'),
      tracks: {
        create: {
          title: 'Neon Nights',
          trackNumber: 1,
          durationMs: 234000,
          isrc: 'USRC12345678',
          status: 'READY',
          audioFormat: 'wav',
          audioBitrate: 1411,
          audioSampleRate: 44100,
        },
      },
    },
  });

  const release2 = await prisma.release.create({
    data: {
      userId: artist.id,
      artistProfileId: artistProfile.id,
      title: 'Digital Dreams EP',
      releaseType: 'EP',
      genre: 'Electronic',
      subgenre: 'Future Bass',
      language: 'EN',
      releaseDate: new Date('2023-11-01'),
      status: 'PENDING',
      isExplicit: false,
      cLineYear: 2023,
      cLineText: 'Cyber Dreamer',
      pLineYear: 2023,
      pLineText: 'Cyber Dreamer',
      coverArtUrl: 'https://picsum.photos/500/500?random=2',
      submittedAt: new Date('2023-10-20'),
      tracks: {
        create: [
          { title: 'Digital Dreams', trackNumber: 1, durationMs: 198000, status: 'READY' },
          { title: 'Cyber Love', trackNumber: 2, durationMs: 212000, status: 'READY' },
          { title: 'Electric Sunrise', trackNumber: 3, durationMs: 245000, status: 'READY' },
          { title: 'Midnight Protocol', trackNumber: 4, durationMs: 187000, status: 'READY' },
        ],
      },
    },
  });

  console.log('Created releases');

  // Create platform settings
  const settings = [
    {
      key: 'brand',
      value: {
        name: 'EAJMUSIC',
        logoUrl: null,
        primaryColor: '#2563EB',
        tagline: 'Tu musica, en todas partes',
      },
      description: 'Platform branding settings',
    },
    {
      key: 'plans',
      value: {
        free: { price: 0, commission: 15, maxArtists: 1 },
        pro: { price: 19.99, commission: 0, maxArtists: 5 },
        label: { price: 49.99, commission: 5, maxArtists: 999 },
      },
      description: 'Subscription plans configuration',
    },
    {
      key: 'distribution',
      value: {
        minReleaseDays: 21,
        autoApprove: false,
        requireIsrc: false,
        requireUpc: false,
      },
      description: 'Distribution settings',
    },
  ];

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('Created platform settings');

  // Create sample announcement
  await prisma.announcement.create({
    data: {
      title: 'Bienvenido a EAJMUSIC',
      content: 'Estamos emocionados de tenerte en nuestra plataforma. Comienza a subir tu musica hoy mismo!',
      type: 'info',
      targetAudience: 'all',
      createdBy: admin.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
