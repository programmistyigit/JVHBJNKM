import { Markup } from 'telegraf';
import { getActiveServices, getActivePortfolioCategories, getAllServices, getAllPortfolioCategories, getAllPortfolioItems, Service, PortfolioCategory, PortfolioItem } from './db';

export const mainMenuKeyboard = Markup.keyboard([
  ['🧾 Buyurtma berish', '📂 Ishlarimiz (Portfolio)'],
  ['📊 Buyurtmam holati', '📞 Bog\'lanish'],
  ['ℹ️ Agentlik haqida']
]).resize();

export const getDynamicServiceTypesKeyboard = () => {
  const services = getActiveServices();
  if (services.length === 0) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('⚠️ Xizmatlar mavjud emas', 'no_services')],
      [Markup.button.callback('🔙 Asosiy menyu', 'back_main')]
    ]);
  }
  const buttons = services.map(s => [Markup.button.callback(`${s.emoji} ${s.name}`, s.callback_id)]);
  return Markup.inlineKeyboard(buttons);
};

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

export const getDynamicPortfolioCategoriesKeyboard = () => {
  const categories = getActivePortfolioCategories();
  if (categories.length === 0) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('⚠️ Kategoriyalar mavjud emas', 'no_categories')],
      [Markup.button.callback('🔙 Orqaga', 'back_main')]
    ]);
  }
  const buttons = categories.map(c => [Markup.button.callback(`${c.emoji} ${c.name}`, c.callback_id)]);
  buttons.push([Markup.button.callback('🔙 Orqaga', 'back_main')]);
  return Markup.inlineKeyboard(buttons);
};

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
  [Markup.button.callback('⚙️ Sozlamalar', 'admin_settings')],
  [Markup.button.callback('🔙 Asosiy menyu', 'back_main')]
]);

export const adminSettingsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🔧 Xizmatlar', 'admin_manage_services')],
  [Markup.button.callback('🖼 Portfolio', 'admin_manage_portfolio')],
  [Markup.button.callback('🏢 Kompaniya ma\'lumotlari', 'admin_company_info')],
  [Markup.button.callback('👥 Worker adminlar', 'admin_manage_workers')],
  [Markup.button.callback('🔙 Admin panel', 'admin_back')]
]);

export const getServicesManageKeyboard = () => {
  const services = getAllServices();
  const buttons: any[] = [];
  for (const s of services) {
    buttons.push([Markup.button.callback(`❌ ${s.emoji} ${s.name}`, `delete_service_${s.id}`)]);
  }
  buttons.push([Markup.button.callback('➕ Yangi xizmat qo\'shish', 'add_service')]);
  buttons.push([Markup.button.callback('🔙 Orqaga', 'admin_settings')]);
  return Markup.inlineKeyboard(buttons);
};

export const getPortfolioManageKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📁 Kategoriyalar', 'admin_portfolio_categories')],
    [Markup.button.callback('🖼 Portfolio ishlar', 'admin_portfolio_items')],
    [Markup.button.callback('🔙 Orqaga', 'admin_settings')]
  ]);
};

export const getPortfolioCategoriesManageKeyboard = () => {
  const categories = getAllPortfolioCategories();
  const buttons: any[] = [];
  for (const c of categories) {
    buttons.push([Markup.button.callback(`❌ ${c.emoji} ${c.name}`, `delete_category_${c.id}`)]);
  }
  buttons.push([Markup.button.callback('➕ Yangi kategoriya', 'add_portfolio_category')]);
  buttons.push([Markup.button.callback('🔙 Orqaga', 'admin_manage_portfolio')]);
  return Markup.inlineKeyboard(buttons);
};

export const getPortfolioItemsManageKeyboard = () => {
  const items = getAllPortfolioItems();
  const buttons: any[] = [];
  for (const item of items.slice(0, 10)) {
    buttons.push([Markup.button.callback(`❌ ${item.title.substring(0, 30)}`, `delete_portfolio_${item.id}`)]);
  }
  buttons.push([Markup.button.callback('➕ Yangi portfolio ish', 'add_portfolio_item')]);
  buttons.push([Markup.button.callback('🔙 Orqaga', 'admin_manage_portfolio')]);
  return Markup.inlineKeyboard(buttons);
};

export const getSelectCategoryKeyboard = () => {
  const categories = getAllPortfolioCategories();
  const buttons = categories.map(c => [Markup.button.callback(`${c.emoji} ${c.name}`, `select_cat_${c.callback_id}`)]);
  buttons.push([Markup.button.callback('🔙 Bekor qilish', 'admin_portfolio_items')]);
  return Markup.inlineKeyboard(buttons);
};

export const companyInfoKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('📞 Telefon 1', 'edit_phone1')],
  [Markup.button.callback('📞 Telefon 2', 'edit_phone2')],
  [Markup.button.callback('📲 Telegram', 'edit_telegram')],
  [Markup.button.callback('📍 Manzil', 'edit_address')],
  [Markup.button.callback('ℹ️ Agentlik haqida matni', 'edit_about')],
  [Markup.button.callback('🔙 Orqaga', 'admin_settings')]
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

export const cancelKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Bekor qilish', 'admin_settings')]
]);

export const getReplyKeyboard = (questionId: number) => Markup.inlineKeyboard([
  [Markup.button.callback('✉️ Javob yozish', `reply_question_${questionId}`)]
]);

export const broadcastButtonsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Buttonsiz yuborish', 'broadcast_no_buttons')],
  [Markup.button.callback('🔘 Button qo\'shish', 'broadcast_add_buttons')],
  [Markup.button.callback('❌ Bekor qilish', 'broadcast_cancel')]
]);

export const getWorkerAdminsKeyboard = () => {
  const { getWorkerAdmins } = require('./db');
  const admins = getWorkerAdmins();
  const buttons: any[] = [];
  for (const admin of admins) {
    const name = admin.full_name || admin.username || `ID: ${admin.user_id}`;
    buttons.push([Markup.button.callback(`❌ ${name}`, `remove_admin_${admin.user_id}`)]);
  }
  buttons.push([Markup.button.callback('➕ Yangi admin qo\'shish', 'add_worker_admin')]);
  buttons.push([Markup.button.callback('🔙 Orqaga', 'admin_settings')]);
  return Markup.inlineKeyboard(buttons);
};

export const cancelAdminActionKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Bekor qilish', 'admin_manage_workers')]
]);

export const cancelReplyKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Bekor qilish', 'admin_back')]
]);
