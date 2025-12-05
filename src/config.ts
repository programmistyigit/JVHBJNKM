import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
  adminChatId: process.env.ADMIN_CHAT_ID || '',
  
  contact: {
    phone1: '+998 90 123 45 67',
    phone2: '+998 91 234 56 78',
    telegram: '@milliybrend',
    address: 'Samarkand shahar, Amir Temur ko\'chasi 1'
  }
};

export const isAdmin = (userId: number): boolean => {
  return config.adminIds.includes(userId);
};
