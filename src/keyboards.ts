import { Markup } from 'telegraf';

export const mainMenuKeyboard = Markup.keyboard([
  ['🧾 Buyurtma berish', '📂 Ishlarimiz (Portfolio)'],
  ['📊 Buyurtmam holati', '📞 Bog\'lanish'],
  ['ℹ️ Agentlik haqida']
]).resize();

export const serviceTypesKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🎨 Grafika dizayni', 'service_grafika')],
  [Markup.button.callback('🖨 Poligrafiya', 'service_poligrafiya')],
  [Markup.button.callback('🧱 3D lettering va hajmli yozuvlar', 'service_3d')],
  [Markup.button.callback('🧬 Brending / Rebrending', 'service_brending')],
  [Markup.button.callback('📱 SMM dizayn', 'service_smm')],
  [Markup.button.callback('🧾 Boshqa xizmat', 'service_boshqa')]
]);

export const budgetKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('💵 1 000 000 gacha', 'budget_1m')],
  [Markup.button.callback('💵 1 000 000 – 3 000 000', 'budget_1_3m')],
  [Markup.button.callback('💵 3 000 000 – 5 000 000', 'budget_3_5m')],
  [Markup.button.callback('💵 5 000 000 dan yuqori', 'budget_5m_plus')],
  [Markup.button.callback('🤝 Aniq emas, kelishamiz', 'budget_kelishamiz')]
]);

export const fileUploadKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Fayl yo\'q', 'no_file')]
]);

export const confirmOrderKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Tasdiqlash', 'confirm_order')],
  [Markup.button.callback('✏️ O\'zgartirish', 'edit_order')]
]);

export const portfolioCategoriesKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('📌 3D lettering va hajmli yozuvlar', 'portfolio_3d')],
  [Markup.button.callback('🖨 Banner va poligrafiya', 'portfolio_banner')],
  [Markup.button.callback('🎨 Logotip va brending', 'portfolio_logo')],
  [Markup.button.callback('📱 SMM dizaynlar', 'portfolio_smm')],
  [Markup.button.callback('🔙 Orqaga', 'back_main')]
]);

export const portfolioBackKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🧾 Buyurtma berish', 'start_order')],
  [Markup.button.callback('🔙 Asosiy menyu', 'back_main')]
]);

export const aboutBackKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🧾 Buyurtma berish', 'start_order')],
  [Markup.button.callback('🔙 Asosiy menyu', 'back_main')]
]);

export const adminMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('📋 Yangi buyurtmalar', 'admin_new_orders')],
  [Markup.button.callback('🔍 Buyurtma qidirish', 'admin_search')],
  [Markup.button.callback('📝 Status o\'zgartirish', 'admin_change_status')],
  [Markup.button.callback('📢 Broadcast', 'admin_broadcast')],
  [Markup.button.callback('🔙 Asosiy menyu', 'back_main')]
]);

export const getStatusKeyboard = (orderId: string) => Markup.inlineKeyboard([
  [Markup.button.callback('🟢 YANGI', `status_${orderId}_YANGI`)],
  [Markup.button.callback('🟡 DIZAYN BOSQICHIDA', `status_${orderId}_DIZAYN BOSQICHIDA`)],
  [Markup.button.callback('🔵 MIJOZ TASDIQIDA', `status_${orderId}_MIJOZ TASDIQIDA`)],
  [Markup.button.callback('🟣 ISHLAB CHIQARISHDA', `status_${orderId}_ISHLAB CHIQARISHDA`)],
  [Markup.button.callback('🟤 O\'RNATILMOQDA', `status_${orderId}_O'RNATILMOQDA`)],
  [Markup.button.callback('⚫️ YOPILGAN', `status_${orderId}_YOPILGAN`)]
]);

export const broadcastConfirmKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Ha, yuborilsin', 'broadcast_confirm')],
  [Markup.button.callback('❌ Bekor qilish', 'broadcast_cancel')]
]);

export const phoneRequestKeyboard = Markup.keyboard([
  [Markup.button.contactRequest('📲 Raqamni yuborish')]
]).resize().oneTime();
