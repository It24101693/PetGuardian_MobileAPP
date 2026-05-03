const Pet = require('../models/Pet');
const HealthPassport = require('../models/HealthPassport');
const { cloudinary } = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// @desc  Get all pets (admin) or by owner
// @route GET /api/pets
const getAllPets = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ownerId: req.user._id, isActive: true };
    const pets = await Pet.find(filter).populate('ownerId', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pets by owner ID
// @route GET /api/pets/owner/:ownerId
const getPetsByOwner = async (req, res, next) => {
  try {
    const pets = await Pet.find({ ownerId: req.params.ownerId, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single pet
// @route GET /api/pets/:id
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'fullName email phoneNumber');
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found.' });
    res.json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pet by QR code (public)
// @route GET /api/pets/qr/:qrCode
const getPetByQrCode = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ qrCode: req.params.qrCode, isActive: true })
      .populate('ownerId', 'fullName phoneNumber');
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found.' });
    const passport = await HealthPassport.findOne({ petId: pet._id });
    res.json({ success: true, data: { pet, passport } });
  } catch (error) {
    next(error);
  }
};

// @desc  Create pet
// @route POST /api/pets
const createPet = async (req, res, next) => {
  try {
    const petData = {
      ...req.body,
      ownerId: req.user._id,
      qrCode: uuidv4(),
    };

    if (req.file) {
      // If using local storage, save relative path. If Cloudinary, path is already a URL.
      petData.imageUrl = req.file.path.includes('public\\uploads') || req.file.path.includes('public/uploads')
        ? `uploads/${req.file.filename}` 
        : req.file.path;
      petData.imagePublicId = req.file.filename;
    }

    const pet = await Pet.create(petData);

    // Auto-create empty health passport
    await HealthPassport.create({ petId: pet._id });

    res.status(201).json({ success: true, message: 'Pet created successfully!', data: pet });
  } catch (error) {
    next(error);
  }
};

// @desc  Update pet
// @route PUT /api/pets/:id
const updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found.' });

    if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this pet.' });
    }

    if (req.file) {
      // Delete old local image if it exists
      if (pet.imageUrl && pet.imageUrl.startsWith('uploads/')) {
        const oldPath = path.join(__dirname, '../../public', pet.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      
      // Delete old Cloudinary image
      if (pet.imagePublicId && !pet.imageUrl.startsWith('uploads/')) {
        const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');
        if (isCloudinaryConfigured) {
          await cloudinary.uploader.destroy(pet.imagePublicId);
        }
      }

      req.body.imageUrl = req.file.path.includes('public\\uploads') || req.file.path.includes('public/uploads')
        ? `uploads/${req.file.filename}` 
        : req.file.path;
      req.body.imagePublicId = req.file.filename;
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Pet updated successfully!', data: updatedPet });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete pet (soft delete)
// @route DELETE /api/pets/:id
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found.' });

    if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this pet.' });
    }

    await Pet.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Pet removed successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get public pet profile (HTML)
// @route GET /api/pets/public/qr/:qrCode
const getPublicPetProfile = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ qrCode: req.params.qrCode, isActive: true })
      .populate('ownerId', 'fullName phoneNumber email');
    
    if (!pet) {
      return res.status(404).send('<h1>Pet not found</h1>');
    }

    // Fallback images
    const defaultImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000';
    
    let petImage = pet.imageUrl;
    
    // Debug logging
    console.log(`[QR Scan] Pet: ${pet.name}, Image URL: ${petImage}`);

    // Ensure we have a valid URL
    if (!petImage || petImage === 'null' || petImage === '' || petImage.startsWith('file:')) {
      petImage = defaultImage;
    } else if (!petImage.startsWith('http')) {
      // If it's a relative path, make it absolute
      const host = req.get('host');
      const protocol = req.protocol;
      petImage = `${protocol}://${host}/${petImage.startsWith('/') ? petImage.slice(1) : petImage}`;
    }

    // Build the HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Found Pet: ${pet.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .card { background: white; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); width: 100%; max-width: 450px; }
        .image-container { width: 100%; height: 300px; background-color: #f1f5f9; position: relative; overflow: hidden; }
        .image { width: 100%; height: 100%; object-fit: cover; }
        .content { padding: 32px; }
        .name { font-size: 32px; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -0.5px; }
        .species { color: #64748b; font-size: 18px; margin-top: 4px; margin-bottom: 32px; }
        .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 16px; font-weight: 700; }
        .owner-info { background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 20px; margin-bottom: 32px; }
        .owner-name { font-size: 20px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b; }
        .owner-phone { font-size: 18px; color: #3b82f6; text-decoration: none; font-weight: 600; }
        .btn { display: block; background: #3b82f6; color: white; text-align: center; padding: 20px; border-radius: 18px; text-decoration: none; font-weight: 700; font-size: 18px; transition: all 0.2s; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2); }
        .btn:active { transform: scale(0.97); background: #2563eb; }
        .emergency { border-left: 4px solid #ef4444; padding-left: 20px; margin-top: 32px; background: #fef2f2; padding: 20px; border-radius: 0 16px 16px 0; }
        .emergency-text { font-size: 15px; color: #b91c1c; line-height: 1.6; margin: 0; }
        .footer-text { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; font-weight: 500; }
    </style>
</head>
<body>
    <div class="card">
        <div class="image-container">
            <img src="${petImage}" class="image" alt="${pet.name}" onerror="this.src='${defaultImage}'">
        </div>
        <div class="content">
            <h1 class="name">${pet.name}</h1>
            <p class="species">${pet.breed ? pet.breed + ' • ' : ''}${pet.species}</p>
            
            <div class="section-title">Owner Contact</div>
            <div class="owner-info">
                <p class="owner-name">${pet.ownerId.fullName}</p>
                <a href="tel:${pet.ownerId.phoneNumber}" class="owner-phone">${pet.ownerId.phoneNumber}</a>
            </div>

            <a href="tel:${pet.ownerId.phoneNumber}" class="btn">Call Owner Now</a>

            ${pet.emergencyNotes ? `
            <div class="emergency">
                <div class="section-title" style="color: #ef4444; margin-bottom: 8px;">Emergency Notes</div>
                <p class="emergency-text">${pet.emergencyNotes}</p>
            </div>
            ` : ''}
            
            <p class="footer-text">
                🐾 PetGuardian - Safety for every pet
            </p>
        </div>
    </div>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPets, getPetsByOwner, getPetById, getPetByQrCode, createPet, updatePet, deletePet, getPublicPetProfile };
