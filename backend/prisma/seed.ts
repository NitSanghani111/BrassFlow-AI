import { PrismaClient, UserRole, CustomerStatus, SupplierStatus, UnitType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Administrator User
  const adminEmail = 'admin@brassflow.in';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Rajesh',
        lastName: 'Shah',
        role: UserRole.ADMINISTRATOR,
        isActive: true,
      },
    });
    console.log('Created default admin: admin@brassflow.in (Password: Admin@123)');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Seed Sample Customers
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        {
          companyName: 'Apex Auto Components Ltd',
          contactName: 'Vijay Mehta',
          email: 'vijay@apexauto.com',
          phone: '+919876543210',
          gstin: '24AAAAC1234A1Z1',
          pan: 'AAAAC1234A',
          billingStreet: 'Phase III, GIDC Industrial Estate',
          billingCity: 'Jamnagar',
          billingState: 'Gujarat',
          billingZip: '361004',
          billingCountry: 'India',
          shippingStreet: 'Plot 42, Sector 2, GIDC Estate',
          shippingCity: 'Jamnagar',
          shippingState: 'Gujarat',
          shippingZip: '361004',
          shippingCountry: 'India',
          outstandingBalance: 150000.00,
          paymentTermsDays: 45,
          status: CustomerStatus.ACTIVE,
          notes: 'High volume buyer of hexagonal brass rods.',
        },
        {
          companyName: 'Metro Valve Industries',
          contactName: 'Sanjay Patel',
          email: 'spatel@metrovalves.in',
          phone: '+919988776655',
          gstin: '27AABBC5678B2Z2',
          pan: 'AABBC5678B',
          billingStreet: 'MIDC Industrial Area, Andheri East',
          billingCity: 'Mumbai',
          billingState: 'Maharashtra',
          billingZip: '400069',
          billingCountry: 'India',
          shippingStreet: 'Warehouse C-9, MIDC Taloja',
          shippingCity: 'Navi Mumbai',
          shippingState: 'Maharashtra',
          shippingZip: '410208',
          shippingCountry: 'India',
          outstandingBalance: 0.00,
          paymentTermsDays: 30,
          status: CustomerStatus.ACTIVE,
          notes: 'Requires delivery challans attached to all invoices.',
        }
      ],
    });
    console.log('Sample customers seeded.');
  }

  // 3. Seed Sample Suppliers
  const supplierCount = await prisma.supplier.count();
  if (supplierCount === 0) {
    await prisma.supplier.createMany({
      data: [
        {
          companyName: 'Saraswati Metal Scrap Merchants',
          contactName: 'Hasmukh Bhai',
          email: 'saraswatimetals@gmail.com',
          phone: '+919123456789',
          gstin: '24AAAPS1122D1Z9',
          pan: 'AAAPS1122D',
          billingStreet: 'Hapa Industrial Area',
          billingCity: 'Jamnagar',
          billingState: 'Gujarat',
          billingZip: '361005',
          outstandingBalance: -85000.00, // Negative means we owe them
          paymentTermsDays: 15,
          status: SupplierStatus.ACTIVE,
          notes: 'Supplies premium grade Honey brass scrap and copper wire scrap.',
        },
        {
          companyName: 'Hindalco Zinc Division',
          contactName: 'Nitin Roy',
          email: 'sales@hindalco.adityabirla.com',
          phone: '+912266667777',
          gstin: '27AAACH0099K1Z4',
          pan: 'AAACH0099K',
          billingStreet: 'Birla Centurion, Worli',
          billingCity: 'Mumbai',
          billingState: 'Maharashtra',
          billingZip: '400030',
          outstandingBalance: 0.00,
          paymentTermsDays: 7,
          status: SupplierStatus.ACTIVE,
          notes: 'Supplier of pure zinc ingots for brass alloy production.',
        }
      ],
    });
    console.log('Sample suppliers seeded.');
  }

  // 4. Seed Sample Products
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          sku: 'BR-ROD-010',
          name: '10mm Round Brass Rod (Grade I)',
          category: 'Brass Rods',
          hsnCode: '74072110',
          gstRate: 18.00,
          unit: UnitType.KG,
          purchasePrice: 420.00,
          sellingPrice: 480.00,
          openingStock: 2500.000,
          currentStock: 2500.000,
          minimumStock: 500.000,
        },
        {
          sku: 'BR-HEX-016',
          name: '16mm Hexagonal Brass Rod (Grade II)',
          category: 'Brass Rods',
          hsnCode: '74072110',
          gstRate: 18.00,
          unit: UnitType.KG,
          purchasePrice: 410.00,
          sellingPrice: 470.00,
          openingStock: 1200.000,
          currentStock: 1200.000,
          minimumStock: 300.000,
        },
        {
          sku: 'BR-SCRP-HONEY',
          name: 'Honey Grade Brass Scrap',
          category: 'Raw Materials',
          hsnCode: '74040022',
          gstRate: 18.00,
          unit: UnitType.KG,
          purchasePrice: 380.00,
          sellingPrice: 410.00,
          openingStock: 8000.000,
          currentStock: 8000.000,
          minimumStock: 1500.000,
        },
        {
          sku: 'ZN-INGOT-99',
          name: 'Zinc Ingot (99.9% Pure)',
          category: 'Raw Materials',
          hsnCode: '79011100',
          gstRate: 18.00,
          unit: UnitType.KG,
          purchasePrice: 240.00,
          sellingPrice: 260.00,
          openingStock: 4500.000,
          currentStock: 4500.000,
          minimumStock: 1000.000,
        }
      ],
    });
    console.log('Sample products seeded.');
  }

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
