// controllers/adminController.js
const User = require("../Moduls/User");
const Location = require("../Moduls/Location");

const createRHM = async (req, res) => {
  try {
    // Only admin allowed
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can create RHM' });
    }

    const {
      username,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password
    } = req.body;

    // check duplicate armyno
    const existingUser = await User.findOne({ armyno });
    if (existingUser) {
      return res.status(400).json({ message: 'Army number already exists' });
    }

    // check duplicate mobile
    const existingMobile = await User.findOne({ mobileno });
    if (existingMobile) {
      return res.status(400).json({ message: 'Mobile already exists' });
    }

    // create RHM
    const rhm = new User({
      username,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password,
      role: 'RHM',
      rhmId: null,
      bhmId: null
    });

    await rhm.save();

    res.status(201).json({
      success: true,
      message: 'RHM created successfully',
      data: rhm
    });

  } catch (error) {
    console.error('Create RHM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBHM = async (req, res) => {
  try {
    const {
      username,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password,
      rhmId
    } = req.body;

    // required validation
    if (!username || !armyno || !rank || !name || !departmentTrade || !mobileno || !password || !rhmId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check RHM exists
    const rhm = await User.findById(rhmId);
    if (!rhm || rhm.role !== "RHM") {
      return res.status(404).json({ message: "RHM not found" });
    }

    // check max 4 BHM per RHM
    if (rhm.bhmCount >= 4) {
      return res.status(400).json({ message: "This RHM already has 4 BHM" });
    }

    // check duplicate
    const existing = await User.findOne({
      $or: [{ username }, { armyno }, { mobileno }]
    });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create BHM
    const bhm = new User({
      username,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password,
      role: "BHM",
      rhmId: rhm._id,
      bhmId: null
    });

    await bhm.save();

    // increment RHM counter
    rhm.bhmCount += 1;
    await rhm.save();

    res.status(201).json({
      success: true,
      message: "BHM created successfully",
      data: bhm
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// const createEmployee = async (req, res) => {
//   try {
//     const {
//       username,
//       password,
//       armyno,
//       rank,
//       name,
//       departmentTrade,
//       mobileno,
//       bhmId
//     } = req.body;

//     // validation
//     if (!username || !password || !armyno || !rank || !name || !departmentTrade || !mobileno || !bhmId) {
//       return res.status(400).json({ error: "All fields required" });
//     }

//     // check unique armyno
//     const existing = await User.findOne({ armyno });
//     if (existing) {
//       return res.status(400).json({ error: "Army number already exists" });
//     }

//     // find BHM
//     const bhm = await User.findOne({ _id: bhmId, role: "BHM" });
//     if (!bhm) {
//       return res.status(404).json({ error: "BHM not found" });
//     }

//     // check limit
//     if (bhm.employeeCount >= 150) {
//       return res.status(400).json({ error: "BHM employee limit reached (150)" });
//     }

//     // create employee
//     const employee = new User({
//       username,
//       password,
//       armyno,
//       rank,
//       name,
//       departmentTrade,
//       mobileno,
//       role: "EMPLOYEE",
//       rhmId: bhm.rhmId,  // auto assign
//       bhmId: bhm._id
//     });

//     await employee.save();

//     // increment employee count
//     bhm.employeeCount += 1;
//     await bhm.save();

//     res.status(201).json({
//       success: true,
//       message: "Employee created successfully",
//       data: {
//         id: employee._id,
//         name: employee.name,
//         armyno: employee.armyno,
//         bhmId: employee.bhmId,
//         rhmId: employee.rhmId
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };



const createEmployee = async (req, res) => {
  try {
    const {
      username,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password,
      bhmId
    } = req.body;

    // 1. check BHM exists
    const bhm = await User.findById(bhmId);
    if (!bhm || bhm.role !== "BHM") {
      return res.status(404).json({
        message: "BHM not found"
      });
    }

    // 2. enforce employee limit (150)
    if (bhm.employeeCount >= 150) {
      return res.status(400).json({
        message: "Employee limit reached for this BHM"
      });
    }

    // 3. check duplicate armyno
    const existingArmy = await User.findOne({ armyno });
    if (existingArmy) {
      return res.status(400).json({
        message: "Army number already exists"
      });
    }

    // 4. check duplicate mobile
    const existingMobile = await User.findOne({ mobileno });
    if (existingMobile) {
      return res.status(400).json({
        message: "Mobile number already exists"
      });
    }

    // 5. create employee
    const employee = new User({
      username,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password,
      role: "EMPLOYEE",
      rhmId: bhm.rhmId, // inherit from BHM
      bhmId: bhm._id
    });

    await employee.save();

    // 6. increment employee count
    bhm.employeeCount += 1;
    await bhm.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee
    });

  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const getAllRHM = async (req, res) => {
  try {
    const rhms = await User.find({ role: "RHM" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rhms.length,
      data: rhms
    });

  } catch (error) {
    console.error("Get RHM error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


const getAllBHM = async (req, res) => {
  try {
    const bhms = await User.find({ role: "BHM" })
      .populate("rhmId", "name armyno rank") // show parent RHM
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bhms.length,
      data: bhms
    });

  } catch (error) {
    console.error("Get BHM error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "EMPLOYEE" })
      .populate("rhmId", "name armyno rank")
      .populate("bhmId", "name armyno rank")
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });

  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


const assignBHM = async (req, res) => {
  try {
    const { bhmId, rhmId } = req.body;

    // 1. find BHM
    const bhm = await User.findById(bhmId);
    if (!bhm || bhm.role !== "BHM") {
      return res.status(404).json({
        message: "BHM not found"
      });
    }

    // 2. find new RHM
    const newRHM = await User.findById(rhmId);
    if (!newRHM || newRHM.role !== "RHM") {
      return res.status(404).json({
        message: "RHM not found"
      });
    }

    // 3. check max limit (4 BHM per RHM)
    if (newRHM.bhmCount >= 4) {
      return res.status(400).json({
        message: "RHM already has max 4 BHM"
      });
    }

    // 4. find old RHM
    const oldRHM = await User.findById(bhm.rhmId);

    // 5. update counters
    if (oldRHM) {
      oldRHM.bhmCount -= 1;
      await oldRHM.save();
    }

    newRHM.bhmCount += 1;
    await newRHM.save();

    // 6. assign new RHM
    bhm.rhmId = newRHM._id;
    await bhm.save();

    // 7. update employees under this BHM
    await User.updateMany(
      { bhmId: bhm._id },
      { $set: { rhmId: newRHM._id } }
    );

    res.status(200).json({
      success: true,
      message: "BHM reassigned successfully"
    });

  } catch (error) {
    console.error("Assign BHM error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


const assignEmployee = async (req, res) => {
  try {
    const { employeeId, bhmId } = req.body;

    // 1. find employee
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "EMPLOYEE") {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    // 2. find new BHM
    const newBHM = await User.findById(bhmId);
    if (!newBHM || newBHM.role !== "BHM") {
      return res.status(404).json({
        message: "BHM not found"
      });
    }

    // 3. enforce 150 limit
    if (newBHM.employeeCount >= 150) {
      return res.status(400).json({
        message: "BHM already has max employees"
      });
    }

    // 4. find old BHM
    const oldBHM = await User.findById(employee.bhmId);

    // 5. update counters
    if (oldBHM) {
      oldBHM.employeeCount -= 1;
      await oldBHM.save();
    }

    newBHM.employeeCount += 1;
    await newBHM.save();

    // 6. assign new hierarchy
    employee.bhmId = newBHM._id;
    employee.rhmId = newBHM.rhmId;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee reassigned successfully"
    });

  } catch (error) {
    console.error("Assign employee error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const getLiveLocations = async (req, res) => {
  try {
    const users = await User.find({
      role: "EMPLOYEE",
      "lastLocation.updatedAt": { $ne: null }
    })
      .select("name armyno lastLocation rhmId bhmId")
      .populate("rhmId", "name")
      .populate("bhmId", "name");

    res.json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getLocationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await Location.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const getAdminDashboard = async (req, res) => {
  try {

    // counts
    const [
      totalRHM,
      totalBHM,
      totalEmployees,
      totalUsers
    ] = await Promise.all([
      User.countDocuments({ role: "RHM" }),
      User.countDocuments({ role: "BHM" }),
      User.countDocuments({ role: "EMPLOYEE" }),
      User.countDocuments()
    ]);

    // active employees (location available)
    const activeEmployees = await User.countDocuments({
      role: "EMPLOYEE",
      "lastLocation.updatedAt": { $ne: null }
    });

    // recent users
    const recentUsers = await User.find()
      .select("name role armyno rank createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // hierarchy summary
    const rhmSummary = await User.find({ role: "RHM" })
      .select("name armyno bhmCount");

    const bhmSummary = await User.find({ role: "BHM" })
      .select("name armyno employeeCount");

    // live map employees
    const liveEmployees = await User.find({
      role: "EMPLOYEE",
      "lastLocation.updatedAt": { $ne: null }
    })
      .select("name armyno lastLocation rhmId bhmId")
      .populate("rhmId", "name")
      .populate("bhmId", "name");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRHM,
        totalBHM,
        totalEmployees,
        activeEmployees
      },
      recentUsers,
      hierarchy: {
        rhmSummary,
        bhmSummary
      },
      liveEmployees
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {createRHM,createBHM,createEmployee,getAllRHM,getAllBHM,getAllEmployees,assignBHM,assignEmployee,getLiveLocations,getLocationHistory,getAdminDashboard};