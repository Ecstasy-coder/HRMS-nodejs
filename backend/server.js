const express    = require('express');
const bcrypt     = require('bcryptjs');
const session    = require('express-session');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const cors       = require('cors');
const helmet     = require('helmet');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');
const User       = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');
const birthdayRoutes =
  require("./routes/birthdayRoutes");

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/birthdays",
  birthdayRoutes
);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve all upload folders (avatars + documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'hr_portal_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ── Ensure upload directories exist ─────────────────────────────────────────
const uploadDir   = path.join(__dirname, 'uploads');
const docsDir     = path.join(__dirname, 'uploads', 'documents');
[uploadDir, docsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ── Avatar upload (profile page only) ───────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.session.userId || 'temp'}_${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// ── Seed default HR admin ────────────────────────────────────────────────────
async function seedDB() {
  const existing = await User.findOne({ email: 'hr@ecstasysolutions.org' });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@123', 12);
    await User.create({
      fullName:   'Mude Vishnu Priya',
      email:      'hr@ecstasysolutions.org',
      password:   hash,
      phone:      '9381698422',
      designation:'HR Executive',
      department: 'HR',
      role:       'HR Admin',
      birthday:   '1995-03-24',
      joinedDate: '2026-04-02',
      status:     'Active',
      avatar:     null
    });
    console.log('✅ Default user seeded: hr@ecstasysolutions.org / Admin@123');
  } else {
    console.log('ℹ️  Admin user already exists, skipping seed.');
  }
}

// ── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/profile');
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.get('/profile', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, '..', 'frontend', 'profile.html'));
});

app.get('/users', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, '..', 'frontend', 'users.html'));
});
app.get("/birthdays", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "../frontend/birthdays.html"
    )
  );
  });

// ── API: Auth ────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.userId = user._id.toString();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ── API: Profile ─────────────────────────────────────────────────────────────
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, phone, designation } = req.body;
    if (!fullName || !fullName.trim()) return res.status(400).json({ error: 'Full name is required' });

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { fullName: fullName.trim(), phone: phone?.trim() || '', designation: designation?.trim() || '' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user, message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── API: Avatar upload ────────────────────────────────────────────────────────
app.post('/api/profile/avatar', requireAuth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.avatar) {
      const oldPath = path.join(__dirname, user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.json({ success: true, avatarUrl: avatarPath, message: 'Photo updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// ── API: Delete Avatar ────────────────────────────────────────────────────────
app.delete('/api/profile/avatar', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.avatar) return res.status(400).json({ error: 'No photo to remove' });

    const oldPath = path.join(__dirname, user.avatar);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    user.avatar = null;
    await user.save();

    res.json({ success: true, message: 'Photo removed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── API: Change Password ──────────────────────────────────────────────────────
app.put('/api/profile/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ error: 'All password fields are required' });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'New passwords do not match' });

    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!pwRegex.test(newPassword))
      return res.status(400).json({ error: 'Password must include uppercase, lowercase, number and special character' });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── API: User Management (mounted AFTER auth middleware) ─────────────────────
app.use('/api/users', requireAuth, userRoutes);

// =============================
// JOB CARD MODEL
// =============================

const jobCardSchema = new mongoose.Schema({

  rm_name: {
    type: String,
    required: true
  },

  department: {
    type: String,
    required: true
  },

  project_name: {
    type: String,
    required: true
  },

  hours_worked: {
    type: Number,
    required: true
  },

  work_description: {
    type: String,
    required: true
  },

  work_date: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    default: "pending"
  },

  rating: {
    type: Number,
    default: null
  },

  comment: {
    type: String,
    default: ""
  }

});

const JobCard = mongoose.model(
  "JobCard",
  jobCardSchema
);



// =============================
// JOB CARD APIs
// =============================



// GET ALL JOB CARDS

app.get(
  "/api/jobcards",
  async (req, res) => {

    try {

      const cards =
        await JobCard.find()
        .sort({ work_date: -1 });

      res.json(cards);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server Error"
      });

    }

  }
);




// UPDATE JOB CARD

app.put(
  "/api/jobcards/:id",
  async (req, res) => {

    try {

      const {
        status,
        rating,
        comment
      } = req.body;

      const updated =
        await JobCard.findByIdAndUpdate(

          req.params.id,

          {
            status,
            rating,
            comment
          },

          {
            new: true
          }

        );

      res.json({

        message:
          `Job Card ${status} successfully`,

        updated

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Update Failed"
      });

    }

  }
);





// INSERT DEMO DATA

app.get(
  "/seed-jobcards",
  async (req, res) => {

    try {

      await JobCard.deleteMany();

      await JobCard.insertMany([

        {
          rm_name: "Sasi Kumar",
          department: "Development",
          project_name:
            "HR Management System",

          hours_worked: 8,

          work_description:
            "Completed employee dashboard UI design.",

          status: "pending"
        },

        {
          rm_name: "Arun Kumar",
          department: "Testing",
          project_name:
            "Payroll System",

          hours_worked: 6,

          work_description:
            "Tested payroll calculation module.",

          status: "approved",

          rating: 4
        },

        {
          rm_name: "Vijay",
          department: "Support",
          project_name:
            "Attendance System",

          hours_worked: 5,

          work_description:
            "Resolved attendance sync issue.",

          status: "rejected"
        }

      ]);

      res.send(
        "Demo Job Cards Inserted"
      );

    } catch (err) {

      console.log(err);

      res.status(500).send(
        "Error inserting data"
      );

    }

  }
);


// JOB CARD REVIEW PAGE

app.get("/review-rm-cards", (req, res) => {

  res.sendFile(

    path.join(
      __dirname,
      "../frontend/review-rm-cards.html"
    )

  );

});

app.get("/my-attendence", (req, res) => {

  res.sendFile(

    path.join(
      __dirname,
      "../frontend/my-attendence.html"
    )

  );

});


// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  await seedDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 HR Portal running at http://localhost:${PORT}`);
    console.log(`📧 Login: hr@ecstasysolutions.org`);
    console.log(`🔑 Password: Admin@123\n`);
  });
}

start().catch(err => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
