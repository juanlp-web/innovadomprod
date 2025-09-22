import mongoose from 'mongoose';
import Purchase from './backend/models/Purchase.js';

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/innovadomprod', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAccountPayment() {
  try {
    
    // Datos de prueba
    const purchaseData = {
      purchaseNumber: 'PC-0001',
      supplierName: 'Pago Contable',
      category: 'renta',
      orderDate: new Date(),
      expectedDelivery: new Date(),
      status: 'recibida',
      paymentStatus: 'pagado',
      total: 1000,
      paidAmount: 1000,
      remainingAmount: 0,
      items: [{
        productName: 'Pago renta',
        quantity: 1,
        total: 1000,
        description: 'Pago de renta mensual'
      }],
      notes: 'Pago contable - Cuenta: 1001 - Gastos de Renta',
      isActive: true,
      isAccountPayment: true,
      accountId: new mongoose.Types.ObjectId(),
      accountCode: '1001',
      accountName: 'Gastos de Renta',
      accountType: 'gasto',
      paymentMethod: 'Efectivo',
      reference: 'REF-001'
    };


    // Crear el registro
    const purchase = new Purchase(purchaseData);
    const savedPurchase = await purchase.save();


    // Buscar todos los pagos contables
    const accountPayments = await Purchase.find({ isAccountPayment: true });

    // Buscar todas las compras
    const allPurchases = await Purchase.find({ isActive: true });

  } catch (error) {
  } finally {
    mongoose.connection.close();
  }
}

testAccountPayment();
