import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { isAdmin, isSuperAdmin, config } from '../config';
import { 
  adminMenuKeyboard, 
  getStatusKeyboard, 
  broadcastConfirmKeyboard,
  mainMenuKeyboard,
  adminSettingsKeyboard,
  getServicesManageKeyboard,
  getPortfolioManageKeyboard,
  getPortfolioCategoriesManageKeyboard,
  getPortfolioItemsManageKeyboard,
  getSelectCategoryKeyboard,
  companyInfoKeyboard,
  cancelKeyboard,
  getReplyKeyboard,
  broadcastButtonsKeyboard,
  getWorkerAdminsKeyboard,
  cancelAdminActionKeyboard,
  cancelReplyKeyboard
} from '../keyboards';
import { 
  texts, 
  formatOrderDetails, 
  formatOrderListItem 
} from '../texts';
import { 
  getNewOrders, 
  getAllOrders,
  getOrderById, 
  updateOrderStatus, 
  searchOrders,
  getAllUserIds,
  addService,
  deleteService,
  addPortfolioCategory,
  deletePortfolioCategory,
  addPortfolioItem,
  deletePortfolioItem,
  setSetting,
  getSetting,
  addAdmin,
  removeAdmin,
  getQuestionById,
  markQuestionReplied,
  saveUserQuestion
} from '../db';

interface BroadcastButton {
  text: string;
  url: string;
}

interface AdminSession {
  waitingForSearch?: boolean;
  waitingForStatusOrderId?: boolean;
  waitingForBroadcast?: boolean;
  broadcastMessage?: string;
  broadcastButtons?: BroadcastButton[];
  waitingForBroadcastButtons?: boolean;
  pendingStatusOrderId?: string;
  waitingForNewService?: boolean;
  waitingForNewCategory?: boolean;
  waitingForPortfolioTitle?: boolean;
  waitingForPortfolioDescription?: boolean;
  waitingForPortfolioPhoto?: boolean;
  portfolioCategory?: string;
  portfolioTitle?: string;
  portfolioDescription?: string;
  waitingForPhone1?: boolean;
  waitingForPhone2?: boolean;
  waitingForTelegram?: boolean;
  waitingForAddress?: boolean;
  waitingForAbout?: boolean;
  waitingForNewAdmin?: boolean;
  waitingForReply?: boolean;
  replyQuestionId?: number;
  replyUserId?: number;
}

const adminSessions = new Map<number, AdminSession>();

const getAdminSession = (userId: number): AdminSession => {
  if (!adminSessions.has(userId)) {
    adminSessions.set(userId, {});
  }
  return adminSessions.get(userId)!;
};

const clearAdminSession = (userId: number): void => {
  adminSessions.set(userId, {});
};

export const setupAdminHandlers = (bot: Telegraf): void => {
  bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(texts.notAdmin);
      return;
    }
    
    clearAdminSession(ctx.from.id);
    await ctx.reply(texts.adminPanel, adminMenuKeyboard);
  });

  bot.hears(/^\/open_MBR-\d+$/i, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return;
    }
    
    const orderId = ctx.message.text.replace('/open_', '').toUpperCase();
    const order = getOrderById(orderId);
    
    if (order) {
      await ctx.reply(formatOrderDetails(order), getStatusKeyboard(orderId));
    } else {
      await ctx.reply(`Buyurtma ${orderId} topilmadi.`);
    }
  });

  bot.action('admin_back', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    clearAdminSession(ctx.from.id);
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminPanel, adminMenuKeyboard);
  });

  bot.action('admin_new_orders', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const orders = getNewOrders(10);
    
    if (orders.length === 0) {
      await ctx.answerCbQuery();
      await ctx.reply('Hozircha yangi buyurtmalar yo\'q.');
      return;
    }
    
    await ctx.answerCbQuery();
    await ctx.reply('📋 Oxirgi 10 ta yangi buyurtma:\n');
    
    for (const order of orders) {
      await ctx.reply(formatOrderListItem(order));
    }
  });

  bot.action('admin_search', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const session = getAdminSession(ctx.from.id);
    session.waitingForSearch = true;
    
    await ctx.answerCbQuery();
    await ctx.reply('Qidiruv so\'zini kiriting (ID, kompaniya nomi, ism yoki telefon):');
  });

  bot.action('admin_change_status', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const session = getAdminSession(ctx.from.id);
    session.waitingForStatusOrderId = true;
    
    await ctx.answerCbQuery();
    await ctx.reply('Qaysi buyurtma ID sini o\'zgartirishni xohlaysiz?\n(Masalan: MBR-1024)');
  });

  bot.action('admin_broadcast', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const session = getAdminSession(ctx.from.id);
    session.waitingForBroadcast = true;
    
    await ctx.answerCbQuery();
    await ctx.reply(texts.broadcastAsk);
  });

  bot.action('admin_settings', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    clearAdminSession(ctx.from.id);
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminSettings, adminSettingsKeyboard);
  });

  bot.action('admin_manage_services', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminServices, getServicesManageKeyboard());
  });

  bot.action('add_service', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForNewService = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminAddService, cancelKeyboard);
  });

  bot.action(/^delete_service_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(/^delete_service_(\d+)$/);
    if (match) {
      const id = parseInt(match[1]);
      deleteService(id);
      await ctx.answerCbQuery(texts.adminServiceDeleted);
      await ctx.reply(texts.adminServices, getServicesManageKeyboard());
    }
  });

  bot.action('admin_manage_portfolio', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminPortfolio, getPortfolioManageKeyboard());
  });

  bot.action('admin_portfolio_categories', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminPortfolioCategories, getPortfolioCategoriesManageKeyboard());
  });

  bot.action('add_portfolio_category', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForNewCategory = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminAddCategory, cancelKeyboard);
  });

  bot.action(/^delete_category_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(/^delete_category_(\d+)$/);
    if (match) {
      const id = parseInt(match[1]);
      deletePortfolioCategory(id);
      await ctx.answerCbQuery(texts.adminCategoryDeleted);
      await ctx.reply(texts.adminPortfolioCategories, getPortfolioCategoriesManageKeyboard());
    }
  });

  bot.action('admin_portfolio_items', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminPortfolioItems, getPortfolioItemsManageKeyboard());
  });

  bot.action('add_portfolio_item', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminAddPortfolioItem, getSelectCategoryKeyboard());
  });

  bot.action(/^select_cat_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(/^select_cat_(.+)$/);
    if (match) {
      const session = getAdminSession(ctx.from.id);
      session.portfolioCategory = match[1];
      session.waitingForPortfolioTitle = true;
      await ctx.answerCbQuery();
      await ctx.reply(texts.adminPortfolioItemTitle, cancelKeyboard);
    }
  });

  bot.action(/^delete_portfolio_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(/^delete_portfolio_(\d+)$/);
    if (match) {
      const id = parseInt(match[1]);
      deletePortfolioItem(id);
      await ctx.answerCbQuery(texts.adminPortfolioItemDeleted);
      await ctx.reply(texts.adminPortfolioItems, getPortfolioItemsManageKeyboard());
    }
  });

  bot.action('admin_company_info', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminCompanyInfo(), companyInfoKeyboard);
  });

  bot.action('edit_phone1', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForPhone1 = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminEditPhone1, cancelKeyboard);
  });

  bot.action('edit_phone2', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForPhone2 = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminEditPhone2, cancelKeyboard);
  });

  bot.action('edit_telegram', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForTelegram = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminEditTelegram, cancelKeyboard);
  });

  bot.action('edit_address', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForAddress = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminEditAddress, cancelKeyboard);
  });

  bot.action('edit_about', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForAbout = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminEditAbout, cancelKeyboard);
  });

  // Worker admin management (Super admin only)
  bot.action('admin_manage_workers', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    if (!isSuperAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notSuperAdmin);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminWorkers, getWorkerAdminsKeyboard());
  });

  bot.action('add_worker_admin', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    if (!isSuperAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notSuperAdmin);
      return;
    }
    const session = getAdminSession(ctx.from.id);
    session.waitingForNewAdmin = true;
    await ctx.answerCbQuery();
    await ctx.reply(texts.adminAddWorker, cancelAdminActionKeyboard);
  });

  bot.action(/^remove_admin_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    if (!isSuperAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notSuperAdmin);
      return;
    }
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(/^remove_admin_(\d+)$/);
    if (match) {
      const userId = parseInt(match[1]);
      removeAdmin(userId);
      await ctx.answerCbQuery(texts.adminWorkerRemoved);
      await ctx.reply(texts.adminWorkers, getWorkerAdminsKeyboard());
    }
  });

  // Reply to user question
  bot.action(/^reply_question_(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const match = callbackData.match(/^reply_question_(\d+)$/);
    if (match) {
      const questionId = parseInt(match[1]);
      const question = getQuestionById(questionId);
      
      if (question) {
        const session = getAdminSession(ctx.from.id);
        session.waitingForReply = true;
        session.replyQuestionId = questionId;
        session.replyUserId = question.user_id;
        await ctx.answerCbQuery();
        await ctx.reply(texts.replyToUser, cancelReplyKeyboard);
      } else {
        await ctx.answerCbQuery('Savol topilmadi!');
      }
    }
  });

  // Broadcast with buttons
  bot.action('broadcast_no_buttons', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const session = getAdminSession(ctx.from.id);
    session.broadcastButtons = [];
    
    await ctx.answerCbQuery();
    await ctx.reply(`Xabar:\n\n${session.broadcastMessage}\n\n${texts.broadcastConfirm}`, broadcastConfirmKeyboard);
  });

  bot.action('broadcast_add_buttons', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const session = getAdminSession(ctx.from.id);
    session.waitingForBroadcastButtons = true;
    session.broadcastButtons = [];
    
    await ctx.answerCbQuery();
    await ctx.reply(texts.broadcastButtonFormat);
  });

  bot.action(/^status_MBR-\d+_.+$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const data = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const parts = data.split('_');
    const orderId = parts[1];
    const newStatus = parts.slice(2).join('_');
    
    const order = getOrderById(orderId);
    if (!order) {
      await ctx.answerCbQuery('Buyurtma topilmadi!');
      return;
    }
    
    const success = updateOrderStatus(orderId, newStatus);
    
    if (success) {
      await ctx.answerCbQuery('Status o\'zgartirildi ✅');
      await ctx.reply(texts.statusChanged(orderId, newStatus));
      
      try {
        await ctx.telegram.sendMessage(
          order.user_id,
          texts.userStatusNotification(orderId, newStatus)
        );
      } catch (e) {
        console.error(`Failed to notify user ${order.user_id}:`, e);
      }
    } else {
      await ctx.answerCbQuery('Xatolik yuz berdi!');
    }
  });

  bot.action('broadcast_confirm', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const session = getAdminSession(ctx.from.id);
    const message = session.broadcastMessage;
    const buttons = session.broadcastButtons || [];
    
    if (!message) {
      await ctx.answerCbQuery('Xabar topilmadi!');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const userIds = getAllUserIds();
    let successCount = 0;
    
    let keyboard = undefined;
    if (buttons.length > 0) {
      const inlineButtons = buttons.map(b => [Markup.button.url(b.text, b.url)]);
      keyboard = Markup.inlineKeyboard(inlineButtons);
    }
    
    for (const userId of userIds) {
      try {
        if (keyboard) {
          await ctx.telegram.sendMessage(userId, message, keyboard);
        } else {
          await ctx.telegram.sendMessage(userId, message);
        }
        successCount++;
      } catch (e) {
        console.error(`Failed to send broadcast to ${userId}:`, e);
      }
    }
    
    clearAdminSession(ctx.from.id);
    await ctx.reply(texts.broadcastSent(successCount), adminMenuKeyboard);
  });

  bot.action('broadcast_cancel', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    clearAdminSession(ctx.from.id);
    await ctx.answerCbQuery();
    await ctx.reply(texts.broadcastCancelled, adminMenuKeyboard);
  });

  bot.on(message('photo'), async (ctx, next) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      return next();
    }
    
    const session = getAdminSession(ctx.from.id);
    
    if (session.waitingForPortfolioPhoto) {
      session.waitingForPortfolioPhoto = false;
      const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      
      addPortfolioItem(
        session.portfolioCategory!,
        session.portfolioTitle!,
        session.portfolioDescription!,
        photoId
      );
      
      clearAdminSession(ctx.from.id);
      await ctx.reply(texts.adminPortfolioItemAdded);
      await ctx.reply(texts.adminPortfolioItems, getPortfolioItemsManageKeyboard());
      return;
    }
    
    return next();
  });

  bot.use(async (ctx, next) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      return next();
    }
    
    const session = getAdminSession(ctx.from.id);
    
    if ('text' in (ctx.message || {})) {
      const text = (ctx.message as any).text;
      
      if (text.startsWith('/')) {
        return next();
      }

      // Handle reply to user
      if (session.waitingForReply && session.replyUserId) {
        session.waitingForReply = false;
        
        try {
          await ctx.telegram.sendMessage(
            session.replyUserId,
            `📩 Milliy Brend dan javob:\n\n${text}`
          );
          
          if (session.replyQuestionId) {
            markQuestionReplied(session.replyQuestionId);
          }
          
          await ctx.reply(texts.replySent);
        } catch (e) {
          console.error(`Failed to send reply to user ${session.replyUserId}:`, e);
          await ctx.reply('Xatolik: Foydalanuvchiga xabar yuborib bo\'lmadi.');
        }
        
        clearAdminSession(ctx.from.id);
        return;
      }

      // Handle new admin ID
      if (session.waitingForNewAdmin) {
        session.waitingForNewAdmin = false;
        
        const adminUserId = parseInt(text);
        if (isNaN(adminUserId)) {
          await ctx.reply('Noto\'g\'ri ID format. Raqam kiriting.');
          await ctx.reply(texts.adminWorkers, getWorkerAdminsKeyboard());
          return;
        }
        
        const result = addAdmin(adminUserId, null, null, 'worker');
        if (result) {
          await ctx.reply(texts.adminWorkerAdded);
        } else {
          await ctx.reply(texts.adminWorkerExists);
        }
        await ctx.reply(texts.adminWorkers, getWorkerAdminsKeyboard());
        return;
      }

      // Handle broadcast buttons input
      if (session.waitingForBroadcastButtons) {
        if (text.toLowerCase() === 'tayyor') {
          session.waitingForBroadcastButtons = false;
          
          const buttons = session.broadcastButtons || [];
          let buttonsPreview = '';
          if (buttons.length > 0) {
            buttonsPreview = '\n\nButtonlar:\n' + buttons.map(b => `• ${b.text}`).join('\n');
          }
          
          await ctx.reply(`Xabar:\n\n${session.broadcastMessage}${buttonsPreview}\n\n${texts.broadcastConfirm}`, broadcastConfirmKeyboard);
          return;
        }
        
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.includes('|')) {
            const parts = line.split('|').map((p: string) => p.trim());
            if (parts.length === 2 && parts[0] && parts[1]) {
              session.broadcastButtons = session.broadcastButtons || [];
              session.broadcastButtons.push({ text: parts[0], url: parts[1] });
            }
          }
        }
        
        const addedCount = session.broadcastButtons?.length || 0;
        await ctx.reply(`${addedCount} ta button qo'shildi. Yana qo'shish uchun davom eting yoki "Tayyor" deb yozing.`);
        return;
      }

      if (session.waitingForNewService) {
        session.waitingForNewService = false;
        const parts = text.split(' ');
        const emoji = parts[0];
        const name = parts.slice(1).join(' ');
        
        if (name.length > 0) {
          addService(emoji, name);
          await ctx.reply(texts.adminServiceAdded);
        } else {
          await ctx.reply('Noto\'g\'ri format. Qaytadan urining.');
        }
        await ctx.reply(texts.adminServices, getServicesManageKeyboard());
        return;
      }

      if (session.waitingForNewCategory) {
        session.waitingForNewCategory = false;
        const parts = text.split(' ');
        const emoji = parts[0];
        const name = parts.slice(1).join(' ');
        
        if (name.length > 0) {
          addPortfolioCategory(emoji, name);
          await ctx.reply(texts.adminCategoryAdded);
        } else {
          await ctx.reply('Noto\'g\'ri format. Qaytadan urining.');
        }
        await ctx.reply(texts.adminPortfolioCategories, getPortfolioCategoriesManageKeyboard());
        return;
      }

      if (session.waitingForPortfolioTitle) {
        session.waitingForPortfolioTitle = false;
        session.portfolioTitle = text;
        session.waitingForPortfolioDescription = true;
        await ctx.reply(texts.adminPortfolioItemDescription, cancelKeyboard);
        return;
      }

      if (session.waitingForPortfolioDescription) {
        session.waitingForPortfolioDescription = false;
        session.portfolioDescription = text;
        session.waitingForPortfolioPhoto = true;
        await ctx.reply(texts.adminPortfolioItemPhoto, cancelKeyboard);
        return;
      }

      if (session.waitingForPortfolioPhoto) {
        session.waitingForPortfolioPhoto = false;
        
        if (text.toLowerCase().includes('rasmsiz') || text.toLowerCase().includes('yo\'q')) {
          addPortfolioItem(
            session.portfolioCategory!,
            session.portfolioTitle!,
            session.portfolioDescription!,
            null
          );
          
          clearAdminSession(ctx.from.id);
          await ctx.reply(texts.adminPortfolioItemAdded);
          await ctx.reply(texts.adminPortfolioItems, getPortfolioItemsManageKeyboard());
        } else {
          await ctx.reply('Iltimos, rasm yuboring yoki "Rasmsiz" deb yozing.');
          session.waitingForPortfolioPhoto = true;
        }
        return;
      }

      if (session.waitingForPhone1) {
        session.waitingForPhone1 = false;
        setSetting('phone1', text);
        await ctx.reply(texts.adminSettingUpdated);
        await ctx.reply(texts.adminCompanyInfo(), companyInfoKeyboard);
        return;
      }

      if (session.waitingForPhone2) {
        session.waitingForPhone2 = false;
        setSetting('phone2', text);
        await ctx.reply(texts.adminSettingUpdated);
        await ctx.reply(texts.adminCompanyInfo(), companyInfoKeyboard);
        return;
      }

      if (session.waitingForTelegram) {
        session.waitingForTelegram = false;
        setSetting('telegram', text);
        await ctx.reply(texts.adminSettingUpdated);
        await ctx.reply(texts.adminCompanyInfo(), companyInfoKeyboard);
        return;
      }

      if (session.waitingForAddress) {
        session.waitingForAddress = false;
        setSetting('address', text);
        await ctx.reply(texts.adminSettingUpdated);
        await ctx.reply(texts.adminCompanyInfo(), companyInfoKeyboard);
        return;
      }

      if (session.waitingForAbout) {
        session.waitingForAbout = false;
        setSetting('about_text', text);
        await ctx.reply(texts.adminSettingUpdated);
        await ctx.reply(texts.adminCompanyInfo(), companyInfoKeyboard);
        return;
      }
      
      if (session.waitingForSearch) {
        session.waitingForSearch = false;
        
        const results = searchOrders(text);
        
        if (results.length === 0) {
          await ctx.reply('Hech narsa topilmadi.');
        } else {
          await ctx.reply(`${results.length} ta natija topildi:\n`);
          for (const order of results) {
            await ctx.reply(formatOrderListItem(order));
          }
        }
        return;
      }
      
      if (session.waitingForStatusOrderId) {
        session.waitingForStatusOrderId = false;
        
        const orderIdPattern = /^MBR-\d+$/i;
        if (!orderIdPattern.test(text.toUpperCase())) {
          await ctx.reply('Noto\'g\'ri format. Iltimos, buyurtma raqamini to\'g\'ri kiriting (Masalan: MBR-1024)');
          return;
        }
        
        const order = getOrderById(text.toUpperCase());
        if (!order) {
          await ctx.reply('Buyurtma topilmadi.');
          return;
        }
        
        session.pendingStatusOrderId = text.toUpperCase();
        await ctx.reply(`Buyurtma: ${order.id}\nJoriy status: ${order.status}\n\nYangi statusni tanlang:`, getStatusKeyboard(order.id));
        return;
      }
      
      if (session.waitingForBroadcast) {
        session.waitingForBroadcast = false;
        session.broadcastMessage = text;
        
        await ctx.reply(`Xabar:\n\n${text}\n\n${texts.broadcastAskButtons}`, broadcastButtonsKeyboard);
        return;
      }
    }
    
    return next();
  });
};
