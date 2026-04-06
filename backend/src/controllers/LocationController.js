const Location = require("../Moduls/Location");
const User = require("../Moduls/User");

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, deviceInfo } = req.body;

    const userId = req.user.userId;

    // 1. store history
    await Location.create({
      userId,
      latitude,
      longitude,
      deviceInfo
    });

    // 2. update last location (fast access)
    await User.findByIdAndUpdate(userId, {
      lastLocation: {
        lat: latitude,
        lng: longitude,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: "Location updated"
    });

  } catch (error) {
    console.error("Location update error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



module.exports = {updateLocation}