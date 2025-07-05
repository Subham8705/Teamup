import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Plus, 
  Calendar,
  User,
  Settings,
  MessageCircle,
  UserPlus,
  Crown,
  X,
  Check,
  Eye,
  Trash2,
  UserMinus,
  Send
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  members: TeamMember[];
  ownerId: string;
  ownerName: string;
  requiredSkills: string[];
  status: 'Open' | 'Closed' | 'Full';
  createdAt: any;
  lastActivity: any;
}

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: any;
  permissions: string[];
}

interface TeamApplication {
  id: string;
  teamId: string;
  teamName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

const Teams: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedTeamForApplication, setSelectedTeamForApplication] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [canCreateTeam, setCanCreateTeam] = useState(true);
  const [lastTeamCreation, setLastTeamCreation] = useState<Date | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerApp, handleSubmit: handleSubmitApp, reset: resetApp } = useForm();
  const { register: registerInvite, handleSubmit: handleSubmitInvite, reset: resetInvite } = useForm();

  const categories = ['Startup', 'Hackathon', 'Open Source', 'Research', 'Learning', 'Competition', 'Side Project'];
  const locations = ['Remote', 'New York', 'San Francisco', 'Los Angeles', 'London', 'Berlin', 'Tokyo', 'Hybrid'];

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchMyTeams();
      fetchApplications();
      fetchInvites();
      checkTeamCreationEligibility();
    }
  }, [user]);

  const checkTeamCreationEligibility = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'teams'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        const lastTeam = snapshot.docs[0].data();
        const lastCreated = lastTeam.createdAt.toDate();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        if (lastCreated > twoDaysAgo) {
          setCanCreateTeam(false);
          setLastTeamCreation(lastCreated);
        }
      }
    } catch (error) {
      console.error('Error checking team creation eligibility:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const q = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchMyTeams = async () => {
    if (!user) return;

    try {
      // Teams I own
      const ownerQuery = query(
        collection(db, 'teams'),
        where('ownerId', '==', user.uid)
      );
      
      // Teams I'm a member of
      const memberQuery = query(collection(db, 'teams'));
      
      const [ownerSnapshot, memberSnapshot] = await Promise.all([
        getDocs(ownerQuery),
        getDocs(memberQuery)
      ]);

      const ownedTeams = ownerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];

      const memberTeams = memberSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Team))
        .filter(team => 
          team.members?.some(member => member.userId === user.uid) && 
          team.ownerId !== user.uid
        );

      setMyTeams([...ownedTeams, ...memberTeams]);
    } catch (error) {
      console.error('Error fetching my teams:', error);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'teamApplications'),
        where('teamOwnerId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamApplication[];
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchInvites = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'teamInvites'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const invitesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamInvite[];
      setInvites(invitesData);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const handleCreateTeam = async (data: any) => {
    if (!user || !userProfile || !canCreateTeam) {
      toast.error('You can only create one team every 2 days');
      return;
    }

    setLoading(true);
    try {
      const teamData = {
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        maxMembers: parseInt(data.maxMembers),
        currentMembers: 1,
        members: [{
          userId: user.uid,
          name: userProfile.name || user.email,
          email: user.email,
          role: 'Owner',
          joinedAt: serverTimestamp(),
          permissions: ['manage_members', 'edit_team', 'delete_team']
        }],
        ownerId: user.uid,
        ownerName: userProfile.name || user.email,
        requiredSkills: data.requiredSkills.split(',').map((skill: string) => skill.trim()),
        status: 'Open',
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      };

      await addDoc(collection(db, 'teams'), teamData);
      toast.success('Team created successfully!');
      setShowCreateForm(false);
      reset();
      fetchTeams();
      fetchMyTeams();
      setCanCreateTeam(false);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTeam = async (data: any) => {
    if (!user || !userProfile || !selectedTeamForApplication) return;

    setLoading(true);
    try {
      // Check if already applied
      const existingQuery = query(
        collection(db, 'teamApplications'),
        where('teamId', '==', selectedTeamForApplication.id),
        where('applicantId', '==', user.uid)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        toast.error('You have already applied to this team');
        return;
      }

      const applicationData = {
        teamId: selectedTeamForApplication.id,
        teamName: selectedTeamForApplication.name,
        teamOwnerId: selectedTeamForApplication.ownerId,
        applicantId: user.uid,
        applicantName: userProfile.name || user.email,
        applicantEmail: user.email,
        message: data.message,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'teamApplications'), applicationData);
      toast.success('Application sent successfully!');
      setShowApplicationModal(false);
      resetApp();
    } catch (error) {
      console.error('Error applying to team:', error);
      toast.error('Failed to send application');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationResponse = async (applicationId: string, status: 'accepted' | 'rejected', application: TeamApplication) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'teamApplications', applicationId), {
        status,
        respondedAt: serverTimestamp()
      });

      if (status === 'accepted') {
        // Add member to team
        const teamRef = doc(db, 'teams', application.teamId);
        const teamDoc = await getDoc(teamRef);
        
        if (teamDoc.exists()) {
          const teamData = teamDoc.data() as Team;
          const newMember: TeamMember = {
            userId: application.applicantId,
            name: application.applicantName,
            email: application.applicantEmail,
            role: 'Member',
            joinedAt: serverTimestamp(),
            permissions: ['view_team']
          };

          await updateDoc(teamRef, {
            members: [...teamData.members, newMember],
            currentMembers: teamData.currentMembers + 1,
            status: teamData.currentMembers + 1 >= teamData.maxMembers ? 'Full' : 'Open',
            lastActivity: serverTimestamp()
          });
        }
      }

      toast.success(`Application ${status}!`);
      fetchApplications();
      fetchMyTeams();
    } catch (error) {
      console.error('Error responding to application:', error);
      toast.error('Failed to respond to application');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (data: any) => {
    if (!user || !userProfile || !selectedTeam) return;

    setLoading(true);
    try {
      // Find user by username
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '==', data.username)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const targetUser = usersSnapshot.docs[0];
      const targetUserData = targetUser.data();

      // Check if user is already a member
      if (selectedTeam.members.some(member => member.userId === targetUser.id)) {
        toast.error('User is already a team member');
        return;
      }

      const inviteData = {
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        fromUserId: user.uid,
        fromUserName: userProfile.name || user.email,
        toUserId: targetUser.id,
        toUserName: targetUserData.name,
        message: data.message,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'teamInvites'), inviteData);
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      resetInvite();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'rejected', invite: TeamInvite) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'teamInvites', inviteId), {
        status,
        respondedAt: serverTimestamp()
      });

      if (status === 'accepted') {
        // Add member to team
        const teamRef = doc(db, 'teams', invite.teamId);
        const teamDoc = await getDoc(teamRef);
        
        if (teamDoc.exists()) {
          const teamData = teamDoc.data() as Team;
          const newMember: TeamMember = {
            userId: user!.uid,
            name: userProfile?.name || user!.email!,
            email: user!.email!,
            role: 'Member',
            joinedAt: serverTimestamp(),
            permissions: ['view_team']
          };

          await updateDoc(teamRef, {
            members: [...teamData.members, newMember],
            currentMembers: teamData.currentMembers + 1,
            status: teamData.currentMembers + 1 >= teamData.maxMembers ? 'Full' : 'Open',
            lastActivity: serverTimestamp()
          });
        }
      }

      toast.success(`Invitation ${status}!`);
      fetchInvites();
      fetchMyTeams();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        const updatedMembers = teamData.members.filter(member => member.userId !== memberId);

        await updateDoc(teamRef, {
          members: updatedMembers,
          currentMembers: updatedMembers.length,
          status: 'Open',
          lastActivity: serverTimestamp()
        });

        toast.success('Member removed successfully!');
        fetchMyTeams();
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        const updatedMembers = teamData.members.filter(member => member.userId !== user.uid);

        await updateDoc(teamRef, {
          members: updatedMembers,
          currentMembers: updatedMembers.length,
          status: 'Open',
          lastActivity: serverTimestamp()
        });

        toast.success('Left team successfully!');
        fetchMyTeams();
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || team.category === selectedCategory;
    const matchesLocation = !selectedLocation || team.location === selectedLocation;
    const notFull = team.status !== 'Full';
    const notMember = !team.members.some(member => member.userId === user?.uid);
    
    return matchesSearch && matchesCategory && matchesLocation && notFull && notMember;
  });

  const getNextCreationDate = () => {
    if (!lastTeamCreation) return null;
    const nextDate = new Date(lastTeamCreation);
    nextDate.setDate(nextDate.getDate() + 2);
    return nextDate;
  };

  const tabs = [
    { id: 'browse', label: 'Browse Teams', icon: Search },
    { id: 'my-teams', label: 'My Teams', icon: Users },
    { id: 'applications', label: `Applications (${applications.length})`, icon: User },
    { id: 'invites', label: `Invites (${invites.length})`, icon: UserPlus }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Hub</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Create teams, find collaborators, and build amazing projects together</p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={!canCreateTeam}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center ${
                  canCreateTeam
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Team
              </button>
            )}
          </div>
          
          {!canCreateTeam && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                You can create your next team on {getNextCreationDate()?.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Browse Teams Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>

                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {filteredTeams.length} teams available
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          {team.category}
                        </span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                          team.status === 'Open' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          team.status === 'Full' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {team.status}
                        </span>
                      </div>
                      <Star className="w-5 h-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {team.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {team.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{team.currentMembers}/{team.maxMembers} members</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{team.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        <span>by {team.ownerName}</span>
                      </div>
                    </div>

                    {team.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {team.requiredSkills.slice(0, 3).map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {team.requiredSkills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                              +{team.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTeamForApplication(team);
                        setShowApplicationModal(true);
                      }}
                      disabled={team.status === 'Full'}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply to Join
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTeams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No teams found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        )}

        {/* My Teams Tab */}
        {activeTab === 'my-teams' && (
          <div className="space-y-6">
            {myTeams.map(team => (
              <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{team.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {team.currentMembers}/{team.maxMembers} members
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {team.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {team.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowTeamChat(true);
                      }}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    {team.ownerId === user?.uid && (
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowInviteModal(true);
                        }}
                        className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Team Members:</h4>
                  {team.members.map(member => (
                    <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          {member.role === 'Owner' ? (
                            <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      {team.ownerId === user?.uid && member.userId !== user.uid && (
                        <button
                          onClick={() => handleRemoveMember(team.id, member.userId)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                      {team.ownerId !== user?.uid && member.userId === user?.uid && (
                        <button
                          onClick={() => handleLeaveTeam(team.id)}
                          className="px-3 py-1 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm"
                        >
                          Leave Team
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {myTeams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No teams yet</h3>
                <p className="text-gray-600 dark:text-gray-300">Create a team or apply to join existing ones</p>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.map(application => (
              <div key={application.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{application.applicantName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{application.applicantEmail}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Applied to: {application.teamName}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{application.message}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApplicationResponse(application.id, 'accepted', application)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApplicationResponse(application.id, 'rejected', application)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications</h3>
                <p className="text-gray-600 dark:text-gray-300">Team applications will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Invites Tab */}
        {activeTab === 'invites' && (
          <div className="space-y-4">
            {invites.map(invite => (
              <div key={invite.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{invite.fromUserName}</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Invited you to: {invite.teamName}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{invite.message}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleInviteResponse(invite.id, 'accepted', invite)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleInviteResponse(invite.id, 'rejected', invite)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {invites.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No invitations</h3>
                <p className="text-gray-600 dark:text-gray-300">Team invitations will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Team</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleCreateTeam)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Name</label>
                  <input
                    {...register('name', { required: 'Team name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter team name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe your team and project"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <select
                      {...register('location', { required: 'Location is required' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select location</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message as string}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Members</label>
                  <input
                    {...register('maxMembers', { 
                      required: 'Max members is required',
                      min: { value: 2, message: 'Minimum 2 members required' },
                      max: { value: 20, message: 'Maximum 20 members allowed' }
                    })}
                    type="number"
                    min="2"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Maximum team size"
                  />
                  {errors.maxMembers && <p className="text-red-500 text-sm mt-1">{errors.maxMembers.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills</label>
                  <input
                    {...register('requiredSkills', { required: 'Required skills are needed' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., React, Node.js, UI/UX (comma-separated)"
                  />
                  {errors.requiredSkills && <p className="text-red-500 text-sm mt-1">{errors.requiredSkills.message as string}</p>}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedTeamForApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Apply to {selectedTeamForApplication.name}</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitApp(handleApplyToTeam)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why do you want to join this team?</label>
                  <textarea
                    {...registerApp('message', { required: 'Message is required' })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell them about your skills and why you'd be a great fit..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Application'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invite to {selectedTeam.name}</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitInvite(handleInviteUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    {...registerInvite('username', { required: 'Username is required' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter username to invite"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invitation Message</label>
                  <textarea
                    {...registerInvite('message', { required: 'Message is required' })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Why would you like them to join your team?"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Team Chat Modal */}
      {showTeamChat && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full h-[80vh] flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTeam.name} - Team Chat</h2>
              <button
                onClick={() => setShowTeamChat(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Chat</h3>
                <p className="text-gray-600 dark:text-gray-300">Chat with your team members here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Team chat functionality will be implemented with real-time messaging
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Teams;