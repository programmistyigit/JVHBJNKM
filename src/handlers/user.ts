import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { 
  mainMenuKeyboard, 
  serviceTypesKeyboard, 
  budgetKeyboard, 
  fileUploadKeyboard,
  confirmOrderKeyboard,
  portfolioCategoriesKeyboard,
  portfolioBackKeyboard,
  aboutBackKeyboard,
  phoneRequestKeyboard
} from '../keyboards';
import { texts, formatOrderSummary, formatOrderStatus, formatNewOrderAdmin } from '../texts';
import { createOrder, generateOrderId, getOrderById, saveUser, Order } from '../db';
import { config } from '../config';

interface SessionData {
  step?: string;
  orderData?: Partial<Order>;
  waitingForQuestion?: boolean;
  waitingForOrderId?: boolean;
}

const sessions = new Map<number, SessionData>();

const getSession = (userId: number): SessionData => {
  if (!sessions.has(userId)) {
    sessions.set(userId, {});
  }
  return sessions.get(userId)!;
};

const clearSession = (userId: number): void => {
  sessions.set(userId, {});
};

const serviceTypeMap: Record<string, string> = {
  'service_grafika': '🎨 Grafika dizayni',
  'service_poligrafiya': '🖨 Poligrafiya',
  'service_3d': '🧱 3D lettering va hajmli yozuvlar',
  'service_brending': '🧬 Brending / Rebrending',
  'service_smm': '📱 SMM dizayn',
  'service_boshqa': '🧾 Boshqa xizmat'
};

const budgetMap: Record<string, string> = {
  'budget_1m': '💵 1 000 000 gacha',
  'budget_1_3m': '💵 1 000 000 – 3 000 000',
  'budget_3_5m': '💵 3 000 000 – 5 000 000',
  'budget_5m_plus': '💵 5 000 000 dan yuqori',
  'budget_kelishamiz': '🤝 Aniq emas, kelishamiz'
};

export const setupUserHandlers = (bot: Telegraf): void => {
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const fullName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
    
    saveUser(userId, username, fullName);
    clearSession(userId);
    
    await ctx.reply(texts.welcome, mainMenuKeyboard);
  });

  bot.hears('🧾 Buyurtma berish', async (ctx) => {
    const session = getSession(ctx.from.id);
    session.step = 'select_service';
    session.orderData = { user_id: ctx.from.id };
    await ctx.reply(texts.selectService, serviceTypesKeyboard);
  });

  bot.hears('📂 Ishlarimiz (Portfolio)', async (ctx) => {
    clearSession(ctx.from.id);
    await ctx.reply(texts.portfolioSelect, portfolioCategoriesKeyboard);
  });

  bot.hears('📊 Buyurtmam holati', async (ctx) => {
    const session = getSession(ctx.from.id);
    session.waitingForOrderId = true;
    session.waitingForQuestion = false;
    await ctx.reply(texts.askOrderId);
  });

  bot.hears('📞 Bog\'lanish', async (ctx) => {
    const session = getSession(ctx.from.id);
    session.waitingForQuestion = true;
    session.waitingForOrderId = false;
    await ctx.reply(texts.contact);
  });

  bot.hears('ℹ️ Agentlik haqida', async (ctx) => {
    clearSession(ctx.from.id);
    await ctx.reply(texts.about, aboutBackKeyboard);
  });

  bot.action(/^service_/, async (ctx) => {
    const session = getSession(ctx.from.id);
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const serviceType = serviceTypeMap[callbackData];
    
    if (serviceType) {
      session.orderData = session.orderData || { user_id: ctx.from.id };
      session.orderData.service_type = serviceType;
      session.step = 'ask_company';
      
      await ctx.answerCbQuery();
      await ctx.reply(texts.askCompanyName);
    }
  });

  bot.action(/^budget_/, async (ctx) => {
    const session = getSession(ctx.from.id);
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    const budget = budgetMap[callbackData];
    
    if (budget && session.step === 'ask_budget') {
      session.orderData!.budget_range = budget;
      session.step = 'ask_file';
      
      await ctx.answerCbQuery();
      await ctx.reply(texts.askFile, fileUploadKeyboard);
    }
  });

  bot.action('no_file', async (ctx) => {
    const session = getSession(ctx.from.id);
    
    if (session.step === 'ask_file') {
      session.orderData!.files = '[]';
      session.step = 'ask_name';
      
      await ctx.answerCbQuery();
      await ctx.reply(texts.askName);
    }
  });

  bot.action('confirm_order', async (ctx) => {
    const session = getSession(ctx.from.id);
    
    if (session.step === 'confirm') {
      const orderId = generateOrderId();
      const orderData = session.orderData!;
      
      const order = createOrder({
        id: orderId,
        user_id: orderData.user_id!,
        user_name: orderData.user_name || '',
        phone: orderData.phone || '',
        service_type: orderData.service_type || '',
        company_name: orderData.company_name || '',
        description: orderData.description || '',
        size_format: orderData.size_format || '',
        address: orderData.address || '',
        deadline: orderData.deadline || '',
        budget_range: orderData.budget_range || '',
        status: 'YANGI',
        files: orderData.files || '[]'
      });

      clearSession(ctx.from.id);
      
      await ctx.answerCbQuery();
      await ctx.reply(texts.orderSuccess(orderId), mainMenuKeyboard);

      for (const adminId of config.adminIds) {
        try {
          await ctx.telegram.sendMessage(adminId, formatNewOrderAdmin(order));
        } catch (e) {
          console.error(`Failed to notify admin ${adminId}:`, e);
        }
      }
    }
  });

  bot.action('edit_order', async (ctx) => {
    const session = getSession(ctx.from.id);
    session.step = 'select_service';
    session.orderData = { user_id: ctx.from.id };
    
    await ctx.answerCbQuery();
    await ctx.reply(texts.selectService, serviceTypesKeyboard);
  });

  bot.action('start_order', async (ctx) => {
    const session = getSession(ctx.from.id);
    session.step = 'select_service';
    session.orderData = { user_id: ctx.from.id };
    
    await ctx.answerCbQuery();
    await ctx.reply(texts.selectService, serviceTypesKeyboard);
  });

  bot.action('back_main', async (ctx) => {
    clearSession(ctx.from.id);
    await ctx.answerCbQuery();
    await ctx.reply('Asosiy menyu 👇', mainMenuKeyboard);
  });

  bot.action(/^portfolio_/, async (ctx) => {
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    await ctx.answerCbQuery();
    
    const portfolioItems: Record<string, { title: string; description: string }> = {
      'portfolio_3d': {
        title: 'The Beauty Room – 3D bo\'rtma harf',
        description: 'Fon: qora, harflar: oq, LED yoritish\nManzil: Samarkand'
      },
      'portfolio_banner': {
        title: 'Premium Banner dizayni',
        description: 'O\'lcham: 3x6m, yuqori sifatli chop\nManzil: Toshkent'
      },
      'portfolio_logo': {
        title: 'Milliy Mebel logotipi',
        description: 'Zamonaviy minimalist uslub\nTo\'liq brend kitmligi'
      },
      'portfolio_smm': {
        title: 'Instagram dizayn paketi',
        description: 'Post, stories, highlights cover\n30 kun uchun kontent rejasi'
      }
    };
    
    const item = portfolioItems[callbackData];
    if (item) {
      const portfolioText = texts.portfolioItem(item.title, item.description);
      await ctx.reply(portfolioText, portfolioBackKeyboard);
    }
  });

  bot.on(message('document'), async (ctx) => {
    const session = getSession(ctx.from.id);
    
    if (session.step === 'ask_file') {
      const fileId = ctx.message.document.file_id;
      const files = JSON.parse(session.orderData!.files || '[]');
      files.push({ type: 'document', file_id: fileId });
      session.orderData!.files = JSON.stringify(files);
      session.step = 'ask_name';
      
      await ctx.reply('Fayl qabul qilindi ✅\n\n' + texts.askName);
    }
  });

  bot.on(message('photo'), async (ctx) => {
    const session = getSession(ctx.from.id);
    
    if (session.step === 'ask_file') {
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      const files = JSON.parse(session.orderData!.files || '[]');
      files.push({ type: 'photo', file_id: fileId });
      session.orderData!.files = JSON.stringify(files);
      session.step = 'ask_name';
      
      await ctx.reply('Rasm qabul qilindi ✅\n\n' + texts.askName);
    }
  });

  bot.on(message('contact'), async (ctx) => {
    const session = getSession(ctx.from.id);
    
    if (session.step === 'ask_phone') {
      session.orderData!.phone = ctx.message.contact.phone_number;
      session.step = 'confirm';
      
      await ctx.reply(formatOrderSummary(session.orderData!), confirmOrderKeyboard);
    }
  });

  bot.on(message('text'), async (ctx) => {
    const session = getSession(ctx.from.id);
    const text = ctx.message.text;

    if (session.waitingForOrderId) {
      session.waitingForOrderId = false;
      
      const orderIdPattern = /^MBR-\d+$/i;
      if (!orderIdPattern.test(text.toUpperCase())) {
        await ctx.reply('Noto\'g\'ri format. Iltimos, buyurtma raqamini to\'g\'ri kiriting (Masalan: MBR-1024)');
        return;
      }
      
      await ctx.reply('Iltimos, kuting, ma\'lumotlar tekshirilmoqda...');
      
      const order = getOrderById(text.toUpperCase());
      if (order) {
        await ctx.reply(formatOrderStatus(order), mainMenuKeyboard);
      } else {
        await ctx.reply(texts.orderNotFound, mainMenuKeyboard);
      }
      return;
    }

    if (session.waitingForQuestion) {
      session.waitingForQuestion = false;
      
      const username = ctx.from.username ? `@${ctx.from.username}` : 'N/A';
      const fullName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
      
      const questionMessage = `✉️ Yangi savol botdan:
User: ${username} / ${fullName}
Matn: ${text}`;
      
      for (const adminId of config.adminIds) {
        try {
          await ctx.telegram.sendMessage(adminId, questionMessage);
        } catch (e) {
          console.error(`Failed to forward question to admin ${adminId}:`, e);
        }
      }
      
      await ctx.reply(texts.questionReceived, mainMenuKeyboard);
      return;
    }

    switch (session.step) {
      case 'ask_company':
        session.orderData!.company_name = text;
        session.step = 'ask_description';
        await ctx.reply(texts.askDescription);
        break;
        
      case 'ask_description':
        session.orderData!.description = text;
        session.step = 'ask_size';
        await ctx.reply(texts.askSize);
        break;
        
      case 'ask_size':
        session.orderData!.size_format = text;
        session.step = 'ask_address';
        await ctx.reply(texts.askAddress);
        break;
        
      case 'ask_address':
        session.orderData!.address = text;
        session.step = 'ask_deadline';
        await ctx.reply(texts.askDeadline);
        break;
        
      case 'ask_deadline':
        session.orderData!.deadline = text;
        session.step = 'ask_budget';
        await ctx.reply(texts.askBudget, budgetKeyboard);
        break;
        
      case 'ask_name':
        session.orderData!.user_name = text;
        session.step = 'ask_phone';
        await ctx.reply(texts.askPhone, phoneRequestKeyboard);
        break;
        
      case 'ask_phone':
        session.orderData!.phone = text;
        session.step = 'confirm';
        await ctx.reply(formatOrderSummary(session.orderData!), confirmOrderKeyboard);
        break;
    }
  });
};
