const Location = require("../Moduls/Location");
const User = require("../Moduls/User");

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, deviceInfo } = req.body;
    const userId = req.user.userId;

    // 1. override latest location (one user one record)
    await Location.findOneAndUpdate(
      { userId },   // find existing
      {
        latitude,
        longitude,
        deviceInfo,
        timestamp: new Date()
      },
      { upsert: true, new: true } // create if not exists
    );

    // 2. update last location in user
    await User.findByIdAndUpdate(userId, {
      lastLocation: {
        lat: latitude,
        lng: longitude,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: "Latest location updated"
    });

  } catch (error) {
    console.error("Location update error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = { updateLocation };