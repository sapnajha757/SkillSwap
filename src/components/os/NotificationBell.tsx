"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { springs } from "@/components/motion/primitives";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, UserPlus, MessageSquare, Cpu, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const { isAuthenticated } = useConvexAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Queries
  const unreadCount = useQuery(api.notifications.unreadCount) || 0;
  const notifications = useQuery(api.notifications.list);
  const seed = useMutation(api.notifications.seed);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Auto-seed for demo purposes if empty
  useEffect(() => {
    if (isAuthenticated && notifications && notifications.length === 0) {
      seed();
    }
  }, [isAuthenticated, notifications, seed]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead({ notificationId: notif._id });
    }
    if (notif.linkUrl) {
      setIsOpen(false);
      router.push(notif.linkUrl);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "match_request": return <UserPlus className="w-4 h-4 text-primary" />;
      case "message":       return <MessageSquare className="w-4 h-4 text-secondary" />;
      case "ai_alert":      return <Cpu className="w-4 h-4 text-tertiary" />;
      case "system": default: return <Info className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        transition={springs.snappy}
        className="relative p-3 rounded-full bg-surface-container/60 backdrop-blur-md border border-border-strong hover:bg-surface-container hover:border-border-strong transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        style={{ willChange: "transform" }}
      >
        <motion.div
          animate={unreadCount > 0 && !shouldReduceMotion ? { rotate: [0, 12, -12, 8, -8, 0] } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          key={unreadCount}
        >
          <Bell className="w-5 h-5 text-text-muted hover:text-text-primary transition-colors" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={shouldReduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.bouncy}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-[0_0_10px_rgba(182,222,195,0.5)]"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={springs.snappy}
            className="absolute top-14 right-0 w-[380px] glass-panel border border-border-strong rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="p-4 border-b border-border-soft flex items-center justify-between bg-surface/50">
              <h3 className="font-display font-bold text-white text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-medium text-tertiary hover:text-tertiary/80 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {!notifications ? (
                <div className="p-8 text-center text-sm font-mono text-text-faint animate-pulse">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <Bell className="w-8 h-8 text-border-strong mb-3" />
                  <p className="text-sm text-text-secondary">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border-soft">
                  {notifications.map((notif: any) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex gap-4 transition-all cursor-pointer hover:bg-surface/40 ${
                        !notif.isRead ? "bg-surface/20" : ""
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.isRead ? "bg-background border border-border-strong" : "bg-surface/50"}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm mb-1 ${!notif.isRead ? "text-white font-bold" : "text-text-secondary font-medium"}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-text-faint font-mono mt-2 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(182,222,195,0.6)] pulse-dot" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
