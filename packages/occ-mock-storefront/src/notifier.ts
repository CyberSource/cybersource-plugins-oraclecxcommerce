import ccLogger from './ccLogger';

export default {
  sendError(_id: string, text: string, _scrollToMessage?: boolean) {
    ccLogger.error('NOTIFIER', text);
  },

  clearError(id: string) {
    ccLogger.info('NOTIFIER', 'Clearing error for ' + id);
  }
};
