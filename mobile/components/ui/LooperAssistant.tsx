import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, 
  TextInput, FlatList, KeyboardAvoidingView, Platform, 
  Dimensions, ActivityIndicator, Animated, ScrollView, PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadow, Radius, FontWeight } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { chatService, ChatMessage } from '../../services/communityService';

const { width, height } = Dimensions.get('window');

export function LooperAssistant() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Draggable logic
  const pan = useRef(new Animated.ValueXY({ x: width - 84, y: height - 160 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  useEffect(() => {
    if (visible) {
      loadHistory();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const loadHistory = async () => {
    try {
      const history = await chatService.getChatHistory();
      if (history.length === 0) {
        setMessages([{
          _id: 'welcome',
          role: 'assistant',
          content: 'Hi! I am Looper. Happy to chat with you! How can I help you today?',
          createdAt: new Date().toISOString()
        }]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || message;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      _id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(textToSend);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, {
        _id: 'error',
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again later.",
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'SCHEDULE CHECKUP', icon: 'medical', color: '#0d9488' },
    { label: 'HEALTH RISK', icon: 'pulse', color: '#6366f1' },
    { label: 'EMERGENCY INFO', icon: 'shield-checkmark', color: '#ef4444' },
  ];

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.msgWrapper, item.role === 'user' ? styles.userWrapper : styles.aiWrapper]}>
      {item.role === 'assistant' && (
        <View style={styles.aiAvatar}>
          <Ionicons name="logo-android" size={14} color="#d97706" />
        </View>
      )}
      <View style={[styles.msgBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.msgText, item.role === 'user' ? styles.userText : styles.aiText]}>
          {item.content}
        </Text>
        <Text style={styles.msgTime}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Animated.View 
        style={[
          styles.fabContainer, 
          { transform: pan.getTranslateTransform() }
        ]} 
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)} activeOpacity={0.9}>
          <LinearGradient colors={['#0d9488', '#0f766e']} style={styles.fabGradient}>
            <Ionicons name="logo-android" size={30} color={Colors.white} />
            <View style={styles.onlineBadge} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.chatWindow, { opacity: fadeAnim }]}>
            <LinearGradient colors={['#0d9488', '#f59e0b']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.chatHeader}>
              <View style={styles.headerInfo}>
                <View style={styles.headerAvatar}>
                  <Ionicons name="logo-android" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Looper</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>AI ASSISTANT ONLINE</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </LinearGradient>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item._id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Looper is thinking...</Text>
              </View>
            )}

            <View style={styles.chatFooter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
                {quickActions.map(action => (
                  <TouchableOpacity 
                    key={action.label} 
                    style={styles.actionChip}
                    onPress={() => handleSend(action.label)}
                  >
                    <Ionicons name={action.icon as any} size={14} color="#475569" />
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type a message..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
                  <Ionicons name="send" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.footerBranding}>
                <Ionicons name="shield-checkmark" size={10} color="#94a3b8" />
                <Text style={styles.brandingText}>SECURE • </Text>
                <Ionicons name="cube" size={10} color="#94a3b8" />
                <Text style={styles.brandingText}>AI POWERED</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    width: 64,
    height: 64,
    zIndex: 1000,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...Shadow.lg,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatWindow: {
    width: width - 40,
    height: height * 0.7,
    backgroundColor: Colors.white,
    borderRadius: 32,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  chatHeader: {
    padding: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 20,
    paddingBottom: 40,
  },
  msgWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  msgBubble: {
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#eff6ff',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#1e40af',
  },
  aiText: {
    color: '#334155',
  },
  msgTime: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  chatFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionsScroll: {
    marginBottom: 16,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  footerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  brandingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
});
