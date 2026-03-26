import * as Print from 'expo-print';

export const imprimirTicket = async (html, printerUrl = null) => {
  await Print.printAsync({
    html,
    printerUrl,
  });
};