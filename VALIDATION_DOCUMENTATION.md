# Digital Health Passport - Validation Documentation

## Backend Validations

### Pet Entity Validations

#### Database Constraints (JPA Annotations)
```java
@Column(name = "owner_id", nullable = false)  // Owner ID is required
@Column(nullable = false, length = 100)       // Name is required, max 100 chars
@Column(nullable = false, length = 50)        // Species is required, max 50 chars
@Column(length = 100)                         // Breed max 100 chars
@Column(name = "blood_type", length = 20)     // Blood type max 20 chars
@Column(length = 50)                          // Color max 50 chars
@Column(name = "microchip_number", unique = true, length = 50)  // Unique microchip
@Column(name = "qr_code", unique = true)      // Unique QR code
@Column(name = "allergies", length = 1000)    // Allergies max 1000 chars
@Column(name = "emergency_contact", length = 150)  // Emergency contact max 150 chars
@Enumerated(EnumType.STRING)
@Column(nullable = false)                     // Gender is required
private Gender gender = Gender.UNKNOWN;
```

#### Business Logic Validations (PetService.java)

**CREATE Pet:**
- ✅ Owner ID is required
- ✅ Gender is required
- ✅ Date of birth cannot be in the future
- ✅ Owner must exist in database
- ✅ QR code is auto-generated and unique

**UPDATE Pet:**
- ✅ Pet must exist (404 if not found)
- ✅ Date of birth cannot be in the future
- ✅ All fields are optional (partial update supported)

**DELETE Pet:**
- ✅ Pet must exist
- ✅ Soft delete (sets isActive = false)

---

### Vaccination Entity Validations

#### Database Constraints
```java
@Column(name = "name", nullable = false, length = 150)  // Vaccine name required, max 150 chars
@Column(length = 150)                                   // Provider max 150 chars
@Column(name = "batch_no", length = 100)                // Batch number max 100 chars
@Column(length = 1000)                                  // Notes max 1000 chars
@Column(length = 50)                                    // Status max 50 chars
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "passport_id", nullable = false)     // Passport ID required
```

#### Business Logic Validations (Frontend)
- ✅ Vaccine name is required
- ✅ Date given is required
- ✅ Next due date is required
- ✅ Alert shown if required fields are missing

---

### Allergy Entity Validations

#### Database Constraints
```java
@NotBlank                                    // Name cannot be blank
@Column(nullable = false, length = 150)      // Name required, max 150 chars
@Column(length = 50)                         // Type max 50 chars
@Column(length = 50)                         // Severity max 50 chars
@Column(length = 1000)                       // Notes max 1000 chars
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "passport_id", nullable = false)  // Passport ID required
```

#### Business Logic Validations
- ✅ Name is required (@NotBlank annotation)
- ✅ Passport must exist

---

### Medical Record Entity Validations

#### Database Constraints
```java
@NotBlank                                    // Title cannot be blank
@Column(nullable = false, length = 200)      // Title required, max 200 chars
@Column(name = "type", length = 50)          // Type max 50 chars
@Column(name = "description", length = 2000) // Description max 2000 chars
@Column(length = 150)                        // Veterinarian max 150 chars
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "passport_id", nullable = false)  // Passport ID required
```

#### Business Logic Validations (Frontend)
- ✅ Title is required
- ✅ Date is required
- ✅ Alert shown if required fields are missing
- ✅ Medications parsed from comma-separated string

---

### Pet Passport Entity Validations

#### Database Constraints
```java
@NotBlank
@Column(name = "pet_name", nullable = false, length = 100)   // Pet name required
@NotBlank
@Column(name = "owner_name", nullable = false, length = 150) // Owner name required
@Column(name = "species", length = 50)                       // Species max 50 chars
@Column(name = "breed", length = 100)                        // Breed max 100 chars
@Column(name = "weight", length = 20)                        // Weight max 20 chars
@Column(name = "color", length = 100)                        // Color max 100 chars
@Column(name = "owner_phone", length = 50)                   // Owner phone max 50 chars
@Column(name = "vet_name", length = 150)                     // Vet name max 150 chars
@Column(name = "vet_clinic", length = 150)                   // Vet clinic max 150 chars
@Column(name = "vet_phone", length = 50)                     // Vet phone max 50 chars
@Column(name = "blood_type", length = 20)                    // Blood type max 20 chars
@Column(name = "microchip_id", length = 100)                 // Microchip max 100 chars
@Column(name = "known_drug_allergies", length = 1000)        // Allergies max 1000 chars
@Column(name = "current_medications", length = 1000)         // Medications max 1000 chars
@Lob
@Column(name = "special_instructions", columnDefinition = "LONGTEXT")  // Large text
@Column(name = "emergency_contact", length = 150)            // Emergency contact max 150 chars
```

---

## Frontend Validations

### Pet Update Form (PetPassport.tsx)

**Current Validations:**
- ✅ Weight must be a positive number
- ✅ Weight must be less than 500kg (unusually high check)
- ✅ Date of birth cannot be in the future
- ✅ Date of birth cannot be more than 50 years ago
- ✅ Emergency contact max 150 characters
- ✅ Image file type validation (JPG, PNG, GIF, WebP only)
- ✅ Image file size validation (max 5MB)

### Vaccination Form

**Current Validations:**
- ✅ Vaccine name is required
- ✅ Date given is required
- ✅ Next due date is required
- ✅ Date given cannot be in the future
- ✅ Next due date must be after date given
- ✅ Warning if next due date is more than 5 years in future

### Medical Record Form

**Current Validations:**
- ✅ Title is required
- ✅ Date is required
- ✅ Date cannot be in the future
- ✅ Title max 200 characters
- ✅ Description max 2000 characters
- ✅ Medications parsed and trimmed

---

## Global Error Handling

### GlobalExceptionHandler.java

**Handles:**
- ✅ RuntimeException → 400 Bad Request (or 404 if "not found" in message)
- ✅ DataIntegrityViolationException → 409 Conflict
- ✅ Returns structured error response with error type and message

**Error Response Format:**
```json
{
  "error": "Resource Error",
  "message": "Specific error message"
}
```

---

## Validation Summary by Operation

### CREATE Operations
| Entity | Required Fields | Business Rules | Status |
|--------|----------------|----------------|--------|
| Pet | name, species, ownerId, gender | DOB not future, owner exists | ✅ |
| Vaccination | vaccineName, dateGiven, nextDueDate | Passport exists | ✅ |
| Allergy | name | Passport exists | ✅ |
| Medical Record | title, date | Passport exists | ✅ |

### UPDATE Operations
| Entity | Validations | Status |
|--------|-------------|--------|
| Pet | DOB not future, pet exists | ✅ |
| Vaccination | Vaccination exists | ✅ |
| Allergy | Allergy exists | ✅ |
| Medical Record | Record exists | ✅ |

### DELETE Operations
| Entity | Validations | Status |
|--------|-------------|--------|
| Pet | Pet exists, soft delete | ✅ |
| Vaccination | Vaccination exists | ✅ |
| Allergy | Allergy exists | ✅ |
| Medical Record | Record exists | ✅ |

---

## Missing Validations (Recommendations)

### Medium Priority
1. Add email format validation for emergency contact (if email)
2. Add phone format validation for emergency contact (if phone)
3. Add blood type format validation (specific formats per species)
4. Add microchip number format validation

### Low Priority
5. Add character count indicators for text fields
6. Add real-time validation feedback
7. Add confirmation dialogs for delete operations

---

## Validation Implementation Summary

### ✅ Completed Validations

**Pet Update:**
- Weight validation (positive number, max 500kg)
- Date of birth validation (not future, not too old)
- Emergency contact length validation
- Image file type validation (JPG, PNG, GIF, WebP)
- Image file size validation (max 5MB)

**Vaccination:**
- Required fields validation
- Date given not in future
- Next due date after date given
- Warning for dates too far in future

**Medical Record:**
- Required fields validation
- Date not in future
- Title length validation (max 200 chars)
- Description length validation (max 2000 chars)

All high-priority validations have been implemented!
