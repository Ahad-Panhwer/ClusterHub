import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Swords, Users, Info, CheckCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, markNotificationRead, clearNotifications } = useData();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'tournament':
        return <Trophy className="w-4 h-4 text-[#8B7CF6]" />;
      case 'match':
        return <Swords className="w-4 h-4 text-[#67B7F7]" />;
      case 'team':
        return <Users className="w-4 h-4 text-[#6FD6B0]" />;
      default:
        return <Info className="w-4 h-4 text-[#FFD978]" />;
    }
  };

  const handleItemClick = (id: string, link?: string) => {
    markNotificationRead(id);
    if (link) {
      navigate(link);
    }
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E9EAF3] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between p-4 border-b border-[#E9EAF3] bg-[#F8F9FE]">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-[#252842]">Notifications</h4>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B7CF6] text-white">
              {notifications.filter((n) => !n.read).length} new
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-[#777D96] hover:text-[#8B7CF6] flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#E9EAF3]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#777D96]">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n.id, n.link)}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#F1EEFF]/40 cursor-pointer transition-colors ${
                !n.read ? 'bg-[#F1EEFF]/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-[#E9EAF3] shrink-0 mt-0.5 shadow-2xs">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className={`text-xs font-semibold ${!n.read ? 'text-[#252842]' : 'text-[#777D96]'}`}>
                    {n.title}
                  </h5>
                  <span className="text-[10px] text-[#777D96] shrink-0">{n.created_at}</span>
                </div>
                <p className="text-xs text-[#777D96] mt-0.5 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#8B7CF6] shrink-0 mt-2" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
