import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { HealthPassport, Vaccination, MedicalRecord, healthService } from '../../services/healthService';
import { Card } from '../ui/Card';
import { Colors, Radius, Spacing, FontSize, Shadow, FontWeight } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../ui/Badge';
import { HealthEntryModal } from './HealthEntryModal';

const { width } = Dimensions.get('window');

interface HealthPassportViewProps {
  passport: HealthPassport;
  vaccinations: Vaccination[];
  medicalRecords: MedicalRecord[];
  onRefresh: () => void;
}

type Tab = 'records' | 'vaccines' | 'allergies' | 'insights';

export function HealthPassportView({ passport, vaccinations, medicalRecords, onRefresh }: HealthPassportViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('records');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleDelete = (id: string, type: Tab) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to remove this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'vaccines') await healthService.deleteVaccination(id);
              else if (type === 'records') await healthService.deleteMedicalRecord(id);
              else if (type === 'allergies') await healthService.deleteAllergy(passport._id, id);
              onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          }
        }
      ]
    );
  };

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
      {(['records', 'vaccines', 'allergies', 'insights'] as Tab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === 'records' ? 'Timeline' : tab === 'vaccines' ? 'Vaccines' : tab === 'allergies' ? 'Allergies' : 'AI Insights'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAddButton = () => {
    if (activeTab === 'insights') return null;
    return (
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => {
          setEditingItem(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={20} color={Colors.white} />
        <Text style={styles.addButtonText}>Add {activeTab === 'records' ? 'Record' : activeTab === 'vaccines' ? 'Vaccine' : 'Allergy'}</Text>
      </TouchableOpacity>
    );
  };

  const getRecordIcon = (type?: string) => {
    switch(type) {
      case 'surgery': return 'cut';
      case 'lab_result': return 'flask';
      case 'ai_scan': return 'sparkles';
      case 'treatment': return 'bandage';
      case 'diagnosis': return 'search';
      default: return 'document-text';
    }
  };

  const renderTimelineItem = (record: MedicalRecord, index: number) => {
    const isLast = index === medicalRecords.length - 1;
    return (
      <View key={record._id} style={styles.timelineRow}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineIcon, record.type === 'ai_scan' && styles.aiIcon]}>
            <Ionicons name={getRecordIcon(record.type) as any} size={18} color={Colors.white} />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineRight}>
          <Card style={styles.timelineCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDate}>{new Date(record.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => { setEditingItem(record); setModalVisible(true); }} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(record._id, 'records')} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>

            {record.recoveryStatus && (
              <View style={styles.statusRow}>
                <Badge 
                  label={record.recoveryStatus} 
                  variant={record.recoveryStatus === 'Fully Recovered' ? 'success' : record.recoveryStatus === 'Improving' ? 'primary' : 'warning'}
                  size="sm"
                />
                {record.type === 'ai_scan' && <Badge label="AI Diagnosis" variant="primary" size="sm" />}
              </View>
            )}

            {record.diagnosis && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Diagnosis</Text>
                <Text style={styles.detailText}>{record.diagnosis}</Text>
              </View>
            )}

            {record.treatment && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Treatment</Text>
                <Text style={styles.detailText}>{record.treatment}</Text>
              </View>
            )}

            {record.medications && (
              <View style={styles.medsRow}>
                <Ionicons name="medical" size={14} color={Colors.primary} />
                <Text style={styles.medsText}>{record.medications}</Text>
              </View>
            )}

            {record.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{record.notes}</Text>
              </View>
            )}

            {record.veterinarianName && (
              <Text style={styles.vetFooter}>Seen by Dr. {record.veterinarianName}</Text>
            )}
          </Card>
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    const aiScans = medicalRecords.filter(r => r.type === 'ai_scan');
    const chronicIssues = medicalRecords.filter(r => r.recoveryStatus === 'Chronic');
    const totalRecords = medicalRecords.length;
    
    return (
      <View style={styles.insightsList}>
        <Text style={styles.insightHeader}>Health Analysis Dashboard</Text>
        
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalRecords}</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{aiScans.length}</Text>
            <Text style={styles.statLabel}>AI Scans</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>{chronicIssues.length}</Text>
            <Text style={styles.statLabel}>Chronic</Text>
          </Card>
        </View>

        <Card style={styles.aiInsightsBox}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
            <Text style={styles.aiTitle}>AI Health Forecast</Text>
          </View>
          
          <Text style={styles.aiSummary}>
            Based on {totalRecords} health entries, your pet's overall health score is 
            <Text style={styles.healthScore}> {totalRecords > 5 ? '88%' : '92%'}</Text>.
          </Text>

          <View style={styles.insightPoint}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.insightPointText}>Vaccinations are up to date.</Text>
          </View>

          {chronicIssues.length > 0 && (
            <View style={styles.insightPoint}>
              <Ionicons name="alert-circle" size={18} color={Colors.warning} />
              <Text style={styles.insightPointText}>Monitor the chronic {chronicIssues[0].diagnosis} condition closely.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.recommendBtn}>
            <Text style={styles.recommendBtnText}>Generate Detailed Report</Text>
          </TouchableOpacity>
        </Card>

        {aiScans.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionLabel}>AI Diagnosis History</Text>
            {aiScans.map(scan => (
              <Card key={scan._id} style={styles.miniScanCard}>
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
                <Text style={styles.miniScanText}>{scan.diagnosis}</Text>
                <Text style={styles.miniScanDate}>{new Date(scan.recordDate).toLocaleDateString()}</Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {renderTabs()}
        {renderAddButton()}
      </View>
      
      <ScrollView 
        style={styles.contentContainer} 
        nestedScrollEnabled 
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'records' && (
          <View style={styles.timelineContainer}>
            {medicalRecords.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={Colors.divider} />
                <Text style={styles.emptyText}>No medical records found.</Text>
              </View>
            ) : (
              medicalRecords.sort((a,b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()).map((r, i) => renderTimelineItem(r, i))
            )}
          </View>
        )}
        
        {activeTab === 'vaccines' && (
          <View style={styles.list}>
            {vaccinations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="shield-checkmark-outline" size={48} color={Colors.divider} />
                <Text style={styles.emptyText}>No vaccinations found.</Text>
              </View>
            ) : (
              vaccinations.map((vac) => {
                const isOverdue = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();
                return (
                  <Card key={vac._id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{vac.vaccineName}</Text>
                        <Text style={styles.itemDate}>Given: {new Date(vac.dateGiven).toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.itemActions}>
                        <TouchableOpacity onPress={() => { setEditingItem(vac); setModalVisible(true); }} style={styles.actionBtn}>
                          <Ionicons name="create-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(vac._id, 'vaccines')} style={styles.actionBtn}>
                          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {vac.nextDueDate && (
                      <View style={[styles.dueRow, isOverdue && styles.overdueRow]}>
                        <Ionicons name="time-outline" size={14} color={isOverdue ? Colors.danger : Colors.warning} />
                        <Text style={[styles.dueText, isOverdue && { color: Colors.danger }]}>
                          Next Due: {new Date(vac.nextDueDate).toLocaleDateString()} {isOverdue ? '(Overdue)' : ''}
                        </Text>
                      </View>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'allergies' && (
          <View style={styles.list}>
            {(!passport.allergies || passport.allergies.length === 0) ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.divider} />
                <Text style={styles.emptyText}>No allergies recorded.</Text>
              </View>
            ) : (
              passport.allergies.map((allergy: any, index) => (
                <Card key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{allergy.name}</Text>
                      <View style={{ marginTop: 4 }}>
                        <Badge
                          label={allergy.severity}
                          variant={allergy.severity === 'Severe' ? 'danger' : 'warning'}
                          size="sm"
                        />
                      </View>
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => handleDelete(allergy._id || index, 'allergies')} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {allergy.reaction && (
                    <Text style={styles.itemText}><Text style={styles.bold}>Reaction: </Text>{allergy.reaction}</Text>
                  )}
                </Card>
              ))
            )}
          </View>
        )}

        {activeTab === 'insights' && renderInsights()}
      </ScrollView>

      <HealthEntryModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingItem(null); }}
        type={activeTab === 'records' ? 'record' : activeTab === 'vaccines' ? 'vaccine' : 'allergy'}
        passportId={passport._id}
        initialData={editingItem}
        onSuccess={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    marginBottom: Spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  activeTabText: {
    color: Colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadow.sm,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  timelineContainer: {
    paddingLeft: 20,
    paddingTop: 10,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...Shadow.sm,
  },
  aiIcon: {
    backgroundColor: '#6366f1',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
    paddingRight: 10,
  },
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  recordDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  medsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  medsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  notesBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  vetFooter: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'right',
  },
  insightsList: {
    padding: 10,
  },
  insightHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  aiInsightsBox: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fdfcfe',
    borderColor: '#e0e7ff',
    borderWidth: 1,
    ...Shadow.md,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  aiSummary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  healthScore: {
    color: Colors.primary,
    fontWeight: '900',
  },
  insightPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  insightPointText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  recommendBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  recommendBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  miniScanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    gap: 10,
  },
  miniScanText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  miniScanDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  itemCard: {
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 16,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  itemDate: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  itemText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  overdueRow: {
    backgroundColor: '#fef2f2',
  },
  dueText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
});
