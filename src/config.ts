import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
  superAdminId: parseInt(process.env.SUPER_ADMIN_ID || '0'),
  adminChatId: process.env.ADMIN_CHAT_ID || '',
  
  contact: {
    phone1: '+998 90 123 45 67',
    phone2: '+998 91 234 56 78',
    telegram: '@milliybrend',
    address: 'Samarkand shahar, Amir Temur ko\'chasi 1'
  }
};

export const isAdmin = (userId: number): boolean => {
  if (config.adminIds.includes(userId) || userId === config.superAdminId) {
    return true;
  }
  const { getAdminByUserId } = require('./db');
  const dbAdmin = getAdminByUserId(userId);
  return !!dbAdmin;
};

export const isSuperAdmin = (userId: number): boolean => {
  return userId === config.superAdminId || (config.adminIds.length > 0 && config.adminIds[0] === userId);
};

export const getAllAdminIds = (): number[] => {
  const { getAllAdmins } = require('./db');
  const dbAdmins = getAllAdmins();
  const dbAdminIds = dbAdmins.map((a: any) => a.user_id);
  const allIds = [...config.adminIds, ...dbAdminIds];
  if (config.superAdminId && !allIds.includes(config.superAdminId)) {
    allIds.push(config.superAdminId);
  }
  return [...new Set(allIds)];
};
