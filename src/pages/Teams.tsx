import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDoc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { toast } from 'react-hot-toast';
import { Users, Plus } from 'lucide-react';

// Import components
import CreateTeamModal from '../components/Teams/CreateTeamModal';
import BrowseTeamsTab from '../components/Teams/BrowseTeamsTab';
import MyTeamsTab from '../components/Teams/MyTeamsTab';
import ApplicationsTab from '../components/Teams/ApplicationsTab';
import InvitesTab from '../components/Teams/InvitesTab';
import TeamManagementModal from '../components/Teams/TeamManagementModal';

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  members: string[];
  ownerId: string;
  ownerName: string;
  requiredSkills: string[];
  status: string;
  createdAt: string;
}

interface Application {
  id: string;
  teamId: string;
  teamName: string;
  teamOwnerId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: string;
  createdAt: string;
}

const Teams: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { markTeamNotificationsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('browse');
  const [teams, setTeams] = useState<Team[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Team creation cooldown
  const [lastTeamCreation, setLastTeamCreation] = useState<Date | null>(null);
  const [canCreateTeam, setCanCreateTeam] = useState(true);
  const [nextCreationDate, setNextCreationDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchApplications();
      fetchInvitations();
      checkTeamCreationCooldown();
    }
  }, [user]);

  // Mark team notifications as read when switching to applications or invites tab
  useEffect(() => {
    if (activeTab === 'applications' || activeTab === 'invites') {
      markTeamNotificationsRead();
    }
  }, [activeTab]);

  const checkTeamCreationCooldown = async () => {
    if (!user) return;

    try {
      const userTeamsQuery = query(
        collection(db, 'teams'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(userTeamsQuery);
      
      if (snapshot.docs.length > 0) {
        const lastTeam = snapshot.docs[0].data();
        const lastCreationDate = new Date(lastTeam.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
        
        setLastTeamCreation(lastCreationDate);
        
        if (lastCreationDate > oneDayAgo) {
          setCanCreateTeam(false);
          const nextAllowed = new Date(lastCreationDate.getTime() + 24 * 60 * 60 * 1000);
          setNextCreationDate(nextAllowed);
        } else {
          setCanCreateTeam(true);
          setNextCreationDate(null);
        }
      }
    } catch (error) {
      console.error('Error checking team creation cooldown:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsQuery = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(teamsQuery);
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const applicationsQuery = query(
        collection(db, 'teamApplications'),
        where('teamOwnerId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(applicationsQuery);
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const invitationsQuery = query(
        collection(db, 'teamInvitations'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(invitationsQuery);
      const invitationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invitation[];
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleCreateTeam = async (data: any) => {
    if (!user || !userProfile || !canCreateTeam) {
      toast.error('Cannot create team at this time');
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
        members: [user.uid],
        ownerId: user.uid,
        ownerName: userProfile.name || user.email,
        requiredSkills: data.requiredSkills ? data.requiredSkills.split(',').map((s: string) => s.trim()) : [],
        status: 'Open',
        createdAt: new Date().toISOString(),
        lastActivity: serverTimestamp()
      };

      await addDoc(collection(db, 'teams'), teamData);
      toast.success('Team created successfully!');
      setShowCreateModal(false);
      fetchTeams();
      checkTeamCreationCooldown();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTeam = async (team: Team) => {
    if (!user || !userProfile) {
      toast.error('Please login to apply');
      return;
    }

    // Check if user already applied
    const existingApplicationQuery = query(
      collection(db, 'teamApplications'),
      where('teamId', '==', team.id),
      where('applicantId', '==', user.uid)
    );
    
    const existingSnapshot = await getDocs(existingApplicationQuery);
    if (!existingSnapshot.empty) {
      toast.error('You have already applied to this team');
      return;
    }

    const message = prompt('Why do you want to join this team?');
    if (!message) return;

    try {
      await addDoc(collection(db, 'teamApplications'), {
        teamId: team.id,
        teamName: team.name,
        teamOwnerId: team.ownerId,
        applicantId: user.uid,
        applicantName: userProfile.name || user.email,
        applicantEmail: user.email,
        message: message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast.success('Application sent successfully!');
    } catch (error) {
      console.error('Error applying to team:', error);
      toast.error('Failed to send application');
    }
  };

  const handleAcceptApplication = async (applicationId: string, applicantId: string, teamId: string) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));

    try {
      // Update application status
      await updateDoc(doc(db, 'teamApplications', applicationId), {
        status: 'accepted',
        respondedAt: new Date().toISOString()
      });

      // Add member to team
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        const updatedMembers = [...teamData.members, applicantId];
        const newMemberCount = updatedMembers.length;
        const newStatus = newMemberCount >= teamData.maxMembers ? 'Full' : 'Open';

        await updateDoc(teamRef, {
          members: updatedMembers,
          currentMembers: newMemberCount,
          status: newStatus,
          lastActivity: serverTimestamp()
        });
      }

      toast.success('Application accepted!');
      fetchApplications();
      fetchTeams();
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));

    try {
      await updateDoc(doc(db, 'teamApplications', applicationId), {
        status: 'rejected',
        respondedAt: new Date().toISOString()
      });

      toast.success('Application rejected');
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleAcceptInvitation = async (invitationId: string, teamId: string) => {
    if (!user) return;

    setActionLoading(prev => ({ ...prev, [invitationId]: true }));

    try {
      // Update invitation status
      await updateDoc(doc(db, 'teamInvitations', invitationId), {
        status: 'accepted',
        respondedAt: new Date().toISOString()
      });

      // Add user to team
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        const updatedMembers = [...teamData.members, user.uid];
        const newMemberCount = updatedMembers.length;
        const newStatus = newMemberCount >= teamData.maxMembers ? 'Full' : 'Open';

        await updateDoc(teamRef, {
          members: updatedMembers,
          currentMembers: newMemberCount,
          status: newStatus,
          lastActivity: serverTimestamp()
        });
      }

      toast.success('Invitation accepted!');
      fetchInvitations();
      fetchTeams();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setActionLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    setActionLoading(prev => ({ ...prev, [invitationId]: true }));

    try {
      await updateDoc(doc(db, 'teamInvitations', invitationId), {
        status: 'rejected',
        respondedAt: new Date().toISOString()
      });

      toast.success('Invitation declined');
      fetchInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to decline invitation');
    } finally {
      setActionLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleChatWithTeam = (teamId: string, teamName: string) => {
    // Navigate to team chat
    window.location.href = `/chat?team=${teamId}&name=${encodeURIComponent(teamName)}`;
  };

  const handleManageTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowManageModal(true);
  };

  const handleInviteUser = async (username: string, message: string) => {
    if (!user || !userProfile || !selectedTeam) return;

    setLoading(true);
    try {
      // Find user by username (assuming username is stored in name field)
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '==', username)
      );
      
      const userSnapshot = await getDocs(usersQuery);
      
      if (userSnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const targetUser = userSnapshot.docs[0];
      const targetUserId = targetUser.id;
      const targetUserData = targetUser.data();

      // Check if user is already a member
      if (selectedTeam.members.includes(targetUserId)) {
        toast.error('User is already a team member');
        return;
      }

      // Check if invitation already exists
      const existingInviteQuery = query(
        collection(db, 'teamInvitations'),
        where('teamId', '==', selectedTeam.id),
        where('toUserId', '==', targetUserId),
        where('status', '==', 'pending')
      );
      
      const existingSnapshot = await getDocs(existingInviteQuery);
      if (!existingSnapshot.empty) {
        toast.error('Invitation already sent to this user');
        return;
      }

      await addDoc(collection(db, 'teamInvitations'), {
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        fromUserId: user.uid,
        fromUserName: userProfile.name || user.email,
        toUserId: targetUserId,
        toUserName: targetUserData.name,
        message: message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast.success(`Invitation sent to ${username}!`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam || !user) return;

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const teamRef = doc(db, 'teams', selectedTeam.id);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        const updatedMembers = teamData.members.filter(id => id !== memberId);
        const newMemberCount = updatedMembers.length;
        const newStatus = newMemberCount < teamData.maxMembers ? 'Open' : teamData.status;

        await updateDoc(teamRef, {
          members: updatedMembers,
          currentMembers: newMemberCount,
          status: newStatus,
          lastActivity: serverTimestamp()
        });

        // Update selected team state
        setSelectedTeam(prev => prev ? {
          ...prev,
          members: updatedMembers,
          currentMembers: newMemberCount,
          status: newStatus
        } : null);
      }

      toast.success('Member removed successfully');
      fetchTeams();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        const updatedMembers = teamData.members.filter(id => id !== user.uid);
        const newMemberCount = updatedMembers.length;
        const newStatus = newMemberCount < teamData.maxMembers ? 'Open' : teamData.status;

        await updateDoc(teamRef, {
          members: updatedMembers,
          currentMembers: newMemberCount,
          status: newStatus,
          lastActivity: serverTimestamp()
        });
      }

      toast.success('Left team successfully');
      fetchTeams();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'teams', teamId));
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile or show profile modal
    console.log('View profile for user:', userId);
    toast.info('Profile viewing feature coming soon!');
  };

  // Get user's teams
  const ownedTeams = teams.filter(team => team.ownerId === user?.uid);
  const memberTeams = teams.filter(team => 
    team.members.includes(user?.uid || '') && team.ownerId !== user?.uid
  );

  const tabs = [
    { id: 'browse', label: 'Browse Teams', count: null },
    { id: 'myteams', label: 'My Teams', count: ownedTeams.length + memberTeams.length },
    { id: 'applications', label: 'Applications', count: applications.length },
    { id: 'invites', label: 'Invites', count: invitations.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Create teams, find collaborators, and build amazing projects together
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Team
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="ml-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'browse' && (
            <BrowseTeamsTab
              teams={teams}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              onApplyToTeam={handleApplyToTeam}
              currentUserId={user?.uid}
            />
          )}

          {activeTab === 'myteams' && (
            <MyTeamsTab
              ownedTeams={ownedTeams}
              memberTeams={memberTeams}
              onChatWithTeam={handleChatWithTeam}
              onManageTeam={handleManageTeam}
              onLeaveTeam={handleLeaveTeam}
              onDeleteTeam={handleDeleteTeam}
              currentUserId={user?.uid}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsTab
              applications={applications}
              onAcceptApplication={handleAcceptApplication}
              onRejectApplication={handleRejectApplication}
              onViewProfile={handleViewProfile}
              loading={actionLoading}
            />
          )}

          {activeTab === 'invites' && (
            <InvitesTab
              invitations={invitations}
              onAcceptInvitation={handleAcceptInvitation}
              onRejectInvitation={handleRejectInvitation}
              loading={actionLoading}
            />
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTeam}
        loading={loading}
        canCreateTeam={canCreateTeam}
        nextCreationDate={nextCreationDate}
      />

      <TeamManagementModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        team={selectedTeam}
        onInviteUser={handleInviteUser}
        onRemoveMember={handleRemoveMember}
        loading={loading}
      />
    </div>
  );
};

export default Teams;