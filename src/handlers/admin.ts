import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { isAdmin, config } from '../config';
import { 
  adminMenuKeyboard, 
  getStatusKeyboard, 
  broadcastConfirmKeyboard,
  mainMenuKeyboard 
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
  getAllUserIds 
} from '../db';

interface AdminSession {
  waitingForSearch?: boolean;
  waitingForStatusOrderId?: boolean;
  waitingForBroadcast?: boolean;
  broadcastMessage?: string;
  pendingStatusOrderId?: string;
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

  bot.action('admin_new_orders', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery(texts.notAdmin);
      return;
    }
    
    const orders = getAllOrders(10);
    
    if (orders.length === 0) {
      await ctx.answerCbQuery();
      await ctx.reply('Hozircha buyurtmalar yo\'q.');
      return;
    }
    
    await ctx.answerCbQuery();
    await ctx.reply('📋 Oxirgi 10 ta buyurtma:\n');
    
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
    
    if (!message) {
      await ctx.answerCbQuery('Xabar topilmadi!');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const userIds = getAllUserIds();
    let successCount = 0;
    
    for (const userId of userIds) {
      try {
        await ctx.telegram.sendMessage(userId, message);
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
        
        await ctx.reply(`Xabar:\n\n${text}\n\n${texts.broadcastConfirm}`, broadcastConfirmKeyboard);
        return;
      }
    }
    
    return next();
  });
};
