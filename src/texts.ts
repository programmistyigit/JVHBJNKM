import { config } from './config';
import { Order } from './db';

export const texts = {
  welcome: `Assalomu alaykum! 👋
Siz Milliy Brend Reklama Agentligining rasmiy botidasiz.
Bu yerda siz:
• Reklama va dizayn bo'yicha buyurtma berishingiz
• Oldingi ishlarimizni ko'rishingiz
• Buyurtmangiz holatini kuzatishingiz
• Operatorlarimiz bilan bog'lanishingiz mumkin.

Quyidagilardan birini tanlang 👇`,

  selectService: `Qanday xizmat bo'yicha buyurtma bermoqchisiz? 👇`,
  
  askCompanyName: `Kompaniya yoki brend nomini yozing:
(Masalan: "Milliy Mebel", "The Beauty Room")`,

  askDescription: `Qisqacha izoh yozing, sizga qanday reklama/dizayn kerak?
(Masalan: 3x6 banner, qora fon, oq harf, premium uslub, yoki: 3D yozuv kirish qismga...)`,

  askSize: `O'lcham yoki formatni kiriting (agar ma'lum bo'lsa):
(Masalan: 3x6 m, 300x70 sm, kvadrat post 1080x1080 va hokazo)`,

  askAddress: `Buyurtma qayerga kerak?
(Manzil yoki shahar: Samarkand, Pastdarg'om, manzil va h.k.)`,

  askDeadline: `Qachongacha tayyor bo'lishi kerak? ⏰
(Masalan: 3 kun ichida, 10-dekabrgacha va hokazo)`,

  askBudget: `Taxminiy budjetingizni tanlang 💰`,

  askFile: `Agar logo, eski dizayn yoki texnik topshiriq fayllaringiz bo'lsa, shu yerga yuboring (rasm, PDF, doc va h.k.).
Agar hech narsa bo'lmasa, "❌ Fayl yo'q" tugmasini bosing.`,

  askName: `Aloqa uchun ism va familiyangizni yozing:`,

  askPhone: `Telefon raqamingizni yuboring 📱
Tugmadan foydalanishingiz mumkin 👇`,

  orderSuccess: (orderId: string) => `Rahmat! 🎉
Buyurtmangiz qabul qilindi.
Bizning menejerlarimiz tez orada siz bilan bog'lanishadi.

Buyurtma raqamingiz: ${orderId}
Shu raqam orqali "📊 Buyurtmam holati" bo'limidan kuzatishingiz mumkin.`,

  askOrderId: `Buyurtma raqamingizni kiriting:
(Masalan: MBR-1024)`,

  orderNotFound: `Kechirasiz, bu raqam bo'yicha buyurtma topilmadi.
Raqamni tekshirib, qaytadan urining yoki operatorlarimiz bilan bog'laning.`,

  contact: `Biz bilan quyidagi usullar orqali bog'lanishingiz mumkin:

☎️ Telefon: ${config.contact.phone1}
☎️ Telefon: ${config.contact.phone2}
📲 Telegram: ${config.contact.telegram}
📍 Manzil: ${config.contact.address}

Savolingiz bo'lsa, shu yerga yozib qoldiring – menejerlarimiz siz bilan bog'lanishadi.`,

  questionReceived: `Savolingiz qabul qilindi ✅
Tez orada siz bilan bog'lanamiz.`,

  about: `🎯 Milliy Brend Reklama Agentligi
"Grafika, poligrafiya va innovatsion reklama markazi"

Asosiy yo'nalishlar:
• Grafika va SMM dizayn
• Poligrafiya (vizitka, flyer, buklet, menyu, katalog)
• 3D burtma harflar va hajmli yozuvlar
• Brending va rebrending
• Veb-sayt va taqdimot dizayni

Bizning maqsadimiz – sizning biznesingizni yangi bosqichga olib chiqish va brendingizni bozorda ajralib turadigan darajaga chiqarish.

Batafsil ma'lumot uchun:
📞 Telefon: ${config.contact.phone1}
🌐 Sayt: (keyin qo'shiladi)`,

  portfolioSelect: `Qaysi yo'nalishdagi ishlarimizni ko'rmoqchisiz? 👇`,

  portfolioItem: (title: string, description: string) => `📍 ${title}
${description}

Sizga shunga o'xshash reklama kerakmi?
"🧾 Buyurtma berish" tugmasini bosing 👇`,

  adminPanel: `⚙️ Admin panel
Tanlang:`,

  notAdmin: `Bu komanda faqat adminlar uchun.`,

  statusChanged: (orderId: string, newStatus: string) => `Status muvaffaqiyatli o'zgartirildi ✅

Buyurtma: ${orderId}
Yangi status: ${newStatus}`,

  userStatusNotification: (orderId: string, newStatus: string) => `Buyurtmangiz ${orderId} statusi yangilandi:
Yangi status: ${newStatus}`,

  broadcastAsk: `Barcha foydalanuvchilarga yuboriladigan xabar matnini yozing:`,

  broadcastConfirm: `Tasdiqlaysizmi?`,

  broadcastSent: (count: number) => `Xabar ${count} ta foydalanuvchiga yuborildi ✅`,

  broadcastCancelled: `Xabar yuborish bekor qilindi.`
};

export const formatOrderSummary = (order: Partial<Order>): string => {
  return `✅ Buyurtma ma'lumotlari:
• Xizmat turi: ${order.service_type || '-'}
• Kompaniya: ${order.company_name || '-'}
• Izoh: ${order.description || '-'}
• O'lcham / format: ${order.size_format || '-'}
• Manzil: ${order.address || '-'}
• Muddat: ${order.deadline || '-'}
• Budjet: ${order.budget_range || '-'}
• Ism: ${order.user_name || '-'}
• Telefon: ${order.phone || '-'}

Hammasi to'g'rimi?`;
};

export const formatOrderDetails = (order: Order): string => {
  const files = JSON.parse(order.files || '[]');
  return `📋 Buyurtma: ${order.id}

Xizmat turi: ${order.service_type}
Kompaniya: ${order.company_name}
Izoh: ${order.description}
O'lcham: ${order.size_format}
Manzil: ${order.address}
Muddat: ${order.deadline}
Budjet: ${order.budget_range}

👤 Mijoz: ${order.user_name}
📞 Telefon: ${order.phone}
📎 Fayllar: ${files.length > 0 ? files.length + ' ta' : 'Yo\'q'}

Status: ${order.status}
Yaratilgan: ${order.created_at}`;
};

export const formatOrderStatus = (order: Order): string => {
  return `Buyurtma: ${order.id}

Xizmat turi: ${order.service_type}
Kompaniya: ${order.company_name}
Status: ${order.status}

Qo'shimcha savollar bo'lsa, "📞 Bog'lanish" bo'limidan murojaat qilishingiz mumkin.`;
};

export const formatNewOrderAdmin = (order: Order): string => {
  return `🆕 Yangi buyurtma!

ID: ${order.id}
Xizmat turi: ${order.service_type}
Kompaniya: ${order.company_name}
Izoh: ${order.description}
O'lcham: ${order.size_format}
Manzil: ${order.address}
Muddat: ${order.deadline}
Budjet: ${order.budget_range}
Ism: ${order.user_name}
Telefon: ${order.phone}

Status: YANGI
Statusni /open_${order.id} komandasi orqali o'zgartiring.`;
};

export const formatOrderListItem = (order: Order): string => {
  return `ID: ${order.id}
Ism: ${order.user_name}
Xizmat: ${order.service_type}
Status: ${order.status}
/open_${order.id}`;
};
