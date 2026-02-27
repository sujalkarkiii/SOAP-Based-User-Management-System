const User = require('../schema/userschema');

const userService = {
  UserService: {
    UserServicePort: {

      // Get all users with pagination
      GetAllUsers: async function(args) {
        try {
          const page  = Math.max(1, parseInt(args.page) || 1);
          const limit = Math.min(Math.max(1, parseInt(args.limit) || 10), 100); // max 100
          const skip  = (page - 1) * limit;

          const [users, total] = await Promise.all([
            User.find().skip(skip).limit(limit).lean(),
            User.countDocuments()
          ]);

          return {
            result: {
              users: users.map(u => ({
                id: u._id.toString(),
                name: u.name,
                email: u.email,
                age: u.age,
                role: u.role,
                createdAt: u.createdAt ? u.createdAt.toISOString() : ''
              })),
              total
            }
          };
        } catch (error) {
          throw { Fault: { faultcode: 'Server', faultstring: `Error fetching users: ${error?.message || error}` } };
        }
      },

      // Get single user by ID
      GetUserById: async function(args) {
        try {
          const user = await User.findById(args.id).lean();
          if (!user) throw { message: 'User not found' };

          return {
            result: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              age: user.age,
              role: user.role,
              createdAt: user.createdAt ? user.createdAt.toISOString() : ''
            }
          };
        } catch (error) {
          throw { Fault: { faultcode: 'Client', faultstring: `Error fetching user: ${error?.message || error}` } };
        }
      },

      // Create new user
      CreateUser: async function(args) {
        try {
          const { user } = args;
          if (!user?.name || !user?.email || !user?.age) throw { message: 'Name, email, and age are required' };

          const saved = await new User({
            name: user.name,
            email: user.email,
            age: user.age,
            role: user.role || 'user'
          }).save();

          return {
            result: {
              id: saved._id.toString(),
              name: saved.name,
              email: saved.email,
              age: saved.age,
              role: saved.role,
              createdAt: saved.createdAt.toISOString()
            }
          };
        } catch (error) {
          throw { Fault: { faultcode: 'Client', faultstring: `Error creating user: ${error?.message || error}` } };
        }
      },

      // Update user by ID
      UpdateUser: async function(args) {
        try {
          const { id, user } = args;
          if (!id) throw { message: 'User ID is required' };

          // Remove undefined fields to avoid overwriting
          const updateData = Object.fromEntries(Object.entries(user).filter(([_, v]) => v !== undefined));

          const updated = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
          if (!updated) throw { message: 'User not found' };

          return { result: { success: true, message: `User ${updated.name} updated successfully` } };
        } catch (error) {
          throw { Fault: { faultcode: 'Client', faultstring: `Error updating user: ${error?.message || error}` } };
        }
      },

      // Delete user by ID
      DeleteUser: async function(args) {
        try {
          const deleted = await User.findByIdAndDelete(args.id);
          if (!deleted) throw { message: 'User not found' };

          return { result: { success: true, message: `User ${deleted.name} deleted successfully` } };
        } catch (error) {
          throw { Fault: { faultcode: 'Client', faultstring: `Error deleting user: ${error?.message || error}` } };
        }
      },

      // Search users by name or email
      SearchUsers: async function(args) {
        try {
          const query = args.query || '';
          const users = await User.find({
            $or: [
              { name:  { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          }).lean();

          return {
            result: {
              users: users.map(u => ({
                id: u._id.toString(),
                name: u.name,
                email: u.email,
                age: u.age,
                role: u.role,
                createdAt: u.createdAt ? u.createdAt.toISOString() : ''
              })),
              total: users.length
            }
          };
        } catch (error) {
          throw { Fault: { faultcode: 'Server', faultstring: `Error searching users: ${error?.message || error}` } };
        }
      }

    }
  }
};

module.exports = userService;