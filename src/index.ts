import { Telegraf } from 'telegraf';
import { config } from './config';
import { setupUserHandlers } from './handlers/user';
import { setupAdminHandlers } from './handlers/admin';

if (!config.botToken) {
  console.error('BOT_TOKEN muhit o\'zgaruvchisi topilmadi!');
  console.log('Iltimos, .env faylida BOT_TOKEN ni sozlang.');
  process.exit(1);
}

const bot = new Telegraf(config.botToken);

setupAdminHandlers(bot);
setupUserHandlers(bot);

bot.catch((err, ctx) => {
  console.error(`Xatolik yuz berdi: ${ctx.updateType}`, err);
});

bot.launch()
  .then(() => {
    console.log('✅ Milliy Brend Reklama Bot ishga tushdi!');
    console.log(`📋 Admin IDlar: ${config.adminIds.join(', ') || 'belgilanmagan'}`);
  })
  .catch((err) => {
    console.error('Bot ishga tushirishda xatolik:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
