import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { healthService, Vaccination, MedicalRecord } from '../../services/healthService';

interface HealthEntryModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'record' | 'vaccine' | 'allergy';
  passportId: string;
  initialData?: any;
  onSuccess: () => void;
}

export function HealthEntryModal({ visible, onClose, type, passportId, initialData, onSuccess }: HealthEntryModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Shared state
  const [notes, setNotes] = useState('');
  const [vetName, setVetName] = useState('');

  // Vaccine state
  const [vaccineName, setVaccineName] = useState('');
  const [dateGiven, setDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [nextDue, setNextDue] = useState('');

  // Record state
  const [title, setTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [meds, setMeds] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'Not Started' | 'In Progress' | 'Improving' | 'Fully Recovered' | 'Chronic'>('Not Started');
  const [recordType, setRecordType] = useState<'diagnosis' | 'treatment' | 'surgery' | 'checkup' | 'lab_result' | 'ai_scan' | 'other'>('checkup');

  // Allergy state
  const [allergyName, setAllergyName] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [reaction, setReaction] = useState('');

  useEffect(() => {
    if (initialData) {
      if (type === 'vaccine') {
        setVaccineName(initialData.vaccineName || '');
        setDateGiven(initialData.dateGiven ? initialData.dateGiven.split('T')[0] : '');
        setNextDue(initialData.nextDueDate ? initialData.nextDueDate.split('T')[0] : '');
        setVetName(initialData.veterinarianName || '');
        setNotes(initialData.notes || '');
      } else if (type === 'record') {
        setTitle(initialData.title || '');
        setDiagnosis(initialData.diagnosis || '');
        setTreatment(initialData.treatment || '');
        setMeds(initialData.medications || '');
        setRecoveryStatus(initialData.recoveryStatus || 'Not Started');
        setRecordType(initialData.type || 'checkup');
        setVetName(initialData.veterinarianName || '');
        setNotes(initialData.notes || '');
      } else if (type === 'allergy') {
        setAllergyName(initialData.name || '');
        setSeverity(initialData.severity || 'Moderate');
        setReaction(initialData.reaction || '');
      }
    } else {
      resetForm();
    }
  }, [initialData, type, visible]);

  const resetForm = () => {
    setNotes('');
    setVetName('');
    setVaccineName('');
    setDateGiven(new Date().toISOString().split('T')[0]);
    setNextDue('');
    setTitle('');
    setDiagnosis('');
    setTreatment('');
    setMeds('');
    setRecoveryStatus('Not Started');
    setRecordType('checkup');
    setAllergyName('');
    setSeverity('Moderate');
    setReaction('');
  };

  const validateForm = () => {
    if (type === 'vaccine') {
      if (!vaccineName.trim()) throw new Error('Vaccine name is required');
      if (!dateGiven.trim()) throw new Error('Date given is required');
      
      const dateGivenObj = new Date(dateGiven);
      if (isNaN(dateGivenObj.getTime())) throw new Error('Invalid Date Given format (YYYY-MM-DD)');
      if (dateGivenObj > new Date()) throw new Error('Date Given cannot be in the future');

      if (nextDue.trim()) {
        const nextDueObj = new Date(nextDue);
        if (isNaN(nextDueObj.getTime())) throw new Error('Invalid Next Due Date format');
        if (nextDueObj <= dateGivenObj) throw new Error('Next Due Date must be after Date Given');
      }
    } else if (type === 'record') {
      if (!title.trim()) throw new Error('Record title is required');
      if (!diagnosis.trim() && !treatment.trim()) throw new Error('Please provide either a Diagnosis or Treatment plan');
    } else if (type === 'allergy') {
      if (!allergyName.trim()) throw new Error('Allergy name is required');
      if (!reaction.trim()) throw new Error('Please describe the typical reaction');
    }
  };

  const handleSave = async () => {
    try {
      validateForm();
      setLoading(true);

      if (type === 'vaccine') {
        const payload = { 
          vaccineName: vaccineName.trim(), 
          dateGiven, 
          nextDueDate: nextDue || undefined, 
          veterinarianName: vetName.trim(), 
          notes: notes.trim() 
        };
        if (initialData?._id) {
          await healthService.updateVaccination(initialData._id, payload);
        } else {
          await healthService.addVaccination(passportId, payload);
        }
      } else if (type === 'record') {
        const payload = { 
          title: title.trim(), 
          type: recordType,
          diagnosis: diagnosis.trim(), 
          treatment: treatment.trim(), 
          medications: meds.trim(), 
          recoveryStatus,
          veterinarianName: vetName.trim(), 
          notes: notes.trim(), 
          recordDate: initialData?.recordDate || new Date().toISOString() 
        };
        if (initialData?._id) {
          await healthService.updateMedicalRecord(initialData._id, payload);
        } else {
          await healthService.addMedicalRecord(passportId, payload);
        }
      } else if (type === 'allergy') {
        await healthService.addAllergy(passportId, { 
          name: allergyName.trim(), 
          severity, 
          reaction: reaction.trim() 
        });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Validation Error', error.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const recoveryStatuses = ['Not Started', 'In Progress', 'Improving', 'Fully Recovered', 'Chronic'];
  const recordTypes = ['diagnosis', 'treatment', 'surgery', 'checkup', 'lab_result', 'ai_scan', 'other'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? 'Edit' : 'Add'} {type === 'record' ? 'Medical Record' : type === 'vaccine' ? 'Vaccination' : 'Allergy'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {type === 'vaccine' && (
              <>
                <Input label="Vaccine Name *" value={vaccineName} onChangeText={setVaccineName} placeholder="e.g. Rabies" />
                <Input label="Date Given (YYYY-MM-DD) *" value={dateGiven} onChangeText={setDateGiven} placeholder="2024-05-01" />
                <Input label="Next Due Date" value={nextDue} onChangeText={setNextDue} placeholder="2025-05-01" />
              </>
            )}

            {type === 'record' && (
              <>
                <Input label="Title *" value={title} onChangeText={setTitle} placeholder="e.g. Skin Rash Checkup" />
                
                <Text style={styles.label}>Record Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {recordTypes.map(rt => (
                    <TouchableOpacity 
                      key={rt} 
                      style={[styles.chip, recordType === rt && styles.chipActive]} 
                      onPress={() => setRecordType(rt as any)}
                    >
                      <Text style={[styles.chipText, recordType === rt && styles.chipTextActive]}>
                        {rt.charAt(0).toUpperCase() + rt.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Input label="Diagnosis Detail" value={diagnosis} onChangeText={setDiagnosis} placeholder="Specific diagnosis..." multiline />
                <Input label="Treatment Plan" value={treatment} onChangeText={setTreatment} placeholder="Steps to recover..." multiline />
                <Input label="Prescriptions / Medications" value={meds} onChangeText={setMeds} placeholder="e.g. Amoxicillin 250mg" />
                
                <Text style={styles.label}>Recovery Progress</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {recoveryStatuses.map(rs => (
                    <TouchableOpacity 
                      key={rs} 
                      style={[styles.chip, recoveryStatus === rs && styles.chipActive]} 
                      onPress={() => setRecoveryStatus(rs as any)}
                    >
                      <Text style={[styles.chipText, recoveryStatus === rs && styles.chipTextActive]}>{rs}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {type === 'allergy' && (
              <>
                <Input label="Allergy Name *" value={allergyName} onChangeText={setAllergyName} placeholder="e.g. Peanuts" />
                <Text style={styles.label}>Severity</Text>
                <View style={styles.segmentedControl}>
                  {['Mild', 'Moderate', 'Severe'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.segment, severity === s && styles.segmentActive]}
                      onPress={() => setSeverity(s)}
                    >
                      <Text style={[styles.segmentText, severity === s && styles.segmentTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input label="Typical Reaction" value={reaction} onChangeText={setReaction} placeholder="e.g. Skin rash" />
              </>
            )}

            {(type === 'vaccine' || type === 'record') && (
              <Input label="Veterinarian Name" value={vetName} onChangeText={setVetName} placeholder="Dr. Smith" />
            )}

            {type !== 'allergy' && (
              <Input label="Additional Vet Notes" value={notes} onChangeText={setNotes} placeholder="Any extra details..." multiline numberOfLines={3} />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button title={initialData ? "Update Entry" : "Add Entry"} onPress={handleSave} loading={loading} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Spacing.lg,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.white,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});
