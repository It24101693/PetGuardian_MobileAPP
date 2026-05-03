import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Platform, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import * as Location from 'expo-location';
let MapView: any, Marker: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} else {
  // Fallback for web to prevent crash
  MapView = (props: any) => <View {...props} style={[props.style, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#64748b' }}>Maps not available on web</Text></View>;
  Marker = () => null;
  PROVIDER_GOOGLE = 'google';
}
import { vetService, Vet } from '../../services/vetService';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function VetDiscoveryScreen() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);

  const categories = ['All', 'Hospital', 'Clinic', 'Doctor'];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        loadAllVets();
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      loadNearbyVets(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  const loadAllVets = async () => {
    try {
      const data = await vetService.getVets();
      setVets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyVets = async (lat: number, lng: number) => {
    try {
      // Fetching with a larger radius initially or just all to show on map
      const data = await vetService.getNearbyVets(lat, lng, 50000); // 50km for better visibility in testing
      setVets(data);
    } catch (error) {
      console.error(error);
      loadAllVets();
    } finally {
      setLoading(false);
    }
  };

  const openMap = (vet: Vet) => {
    const lat = vet.location?.coordinates[1];
    const lng = vet.location?.coordinates[0];
    const latLng = `${lat},${lng}`;
    const label = vet.clinicName || vet.name;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`
    });
    if (url) Linking.openURL(url);
  };

  const makeCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const filteredVets = vets.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                         v.clinicName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || 
                           v.clinicName?.toLowerCase().includes(activeCategory.toLowerCase()) ||
                           v.specialization?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchesAvailability = !showOpenOnly || v.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const renderHeader = () => (
    <View style={styles.heroHeader}>
      <Badge label="Sri Lanka's trusted AI Vet & Clinic finder" variant="primary" size="sm" style={styles.heroBadge} />
      <Text style={styles.heroTitle}>Professional Care.{"\n"}Local Vets.</Text>
      <Text style={styles.heroSubtitle}>Manually verified clinic listings with exact coordinates and real-time availability.</Text>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersWrapper}>
      <Text style={styles.filterLabel}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.availabilityRow}>
        <Text style={styles.filterLabel}>Availability</Text>
        <TouchableOpacity 
          style={[styles.toggleBtn, showOpenOnly && styles.toggleBtnActive]} 
          onPress={() => setShowOpenOnly(!showOpenOnly)}
        >
          <View style={[styles.toggleDot, showOpenOnly && styles.toggleDotActive]} />
          <Text style={[styles.toggleText, showOpenOnly && styles.toggleTextActive]}>Open Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVetItem = ({ item }: { item: Vet }) => (
    <Card style={styles.vetCard}>
      <View style={styles.cardHeader}>
        <View style={styles.clinicIcon}>
          <Ionicons name="medical" size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.clinicName}>{item.clinicName || item.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
            <Text style={styles.vetName}> • By {item.name}</Text>
          </View>
        </View>
        {item.isEmergency && (
          <Badge label="Emergency" variant="danger" size="sm" />
        )}
      </View>

      <View style={styles.specializationRow}>
        {item.specialization?.map((s, i) => (
          <View key={i} style={styles.specBadge}>
            <Text style={styles.specText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={() => makeCall(item.phone)}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.routeBtn]} onPress={() => openMap(item)}>
          <Ionicons name="map" size={18} color={Colors.white} />
          <Text style={styles.routeBtnText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <FlatList
        data={filteredVets}
        keyExtractor={item => item._id}
        ListHeaderComponent={
          <>
            {renderHeader()}
            
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location?.coords.latitude || 6.9271,
                  longitude: location?.coords.longitude || 79.8612,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
                showsUserLocation
                provider={PROVIDER_GOOGLE}
              >
                {filteredVets.map(vet => (
                  vet.location && (
                    <Marker
                      key={vet._id}
                      coordinate={{
                        latitude: vet.location.coordinates[1],
                        longitude: vet.location.coordinates[0],
                      }}
                      title={vet.clinicName}
                      description={vet.specialization?.join(', ')}
                    >
                      <View style={styles.markerContainer}>
                        <View style={[styles.markerPin, vet.isEmergency && styles.markerPinEmergency]}>
                          <Ionicons name="medical" size={12} color={Colors.white} />
                        </View>
                        <View style={styles.markerArrow} />
                      </View>
                    </Marker>
                  )
                ))}
              </MapView>
            </View>

            <View style={styles.searchSection}>
              <Input
                placeholder="Search by name or specialization..."
                value={search}
                onChangeText={setSearch}
                leftIcon="search-outline"
                containerStyle={styles.searchInput}
              />
              {renderFilters()}
            </View>
            
            <Text style={styles.resultsCount}>Showing {filteredVets.length} Results</Text>
          </>
        }
        renderItem={renderVetItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={Colors.divider} />
            <Text style={styles.emptyTitle}>No clinics found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters or "Nearby" range.</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={loadAllVets}>
              <Text style={styles.viewAllText}>View All Collections</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroHeader: {
    padding: Spacing.xl,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    paddingTop: 40,
  },
  heroBadge: {
    marginBottom: 16,
    backgroundColor: '#ccfbf1',
    borderColor: '#99f6e4',
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  markerPinEmergency: {
    backgroundColor: Colors.danger,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    marginTop: -2,
  },
  searchSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInput: {
    marginBottom: 16,
  },
  filtersWrapper: {
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  filterScroll: {
    paddingBottom: 4,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleBtnActive: {
    borderColor: '#0d9488',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginRight: 8,
  },
  toggleDotActive: {
    backgroundColor: '#10b981',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#0f172a',
  },
  resultsCount: {
    padding: Spacing.lg,
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  listContent: {
    paddingBottom: 40,
  },
  vetCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    backgroundColor: Colors.white,
    ...Shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clinicIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 4,
  },
  vetName: {
    fontSize: 13,
    color: '#64748b',
  },
  specializationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  specBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  callBtnText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  routeBtn: {
    backgroundColor: '#0d9488',
    ...Shadow.sm,
  },
  routeBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  viewAllBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: Colors.white,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
});
