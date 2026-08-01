/**
 * routesRegistry — binds every `page` name in lib/routesMeta.js to its
 * component. App.jsx builds its <Route> tree from ROUTES × this map, so
 * adding a page is a two-line change (one entry in routesMeta, one import
 * here) and the page automatically shows up in routing AND on the live
 * system diagram. A meta entry with no component here fails loudly in
 * the registry test (src/__tests__/routesRegistry.test.jsx).
 */
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import AISettings from './pages/AISettings';
import Settings from './pages/Settings';
import PeopleProfiles from './pages/PeopleProfiles';
import PersonProfilePage from './pages/PersonProfilePage';
import FinanceHub from './pages/FinanceHub';
import AssistantHub from './pages/AssistantHub';
import DataHub from './pages/DataHub';
import LifeFilePage from './pages/LifeFilePage';
import DirectivesPage from './pages/DirectivesPage';
import SelfPortrait from './pages/SelfPortrait';
import IdentityProfile from './pages/IdentityProfile';
import PlacesMap from './pages/PlacesMap';
import SahatMap from './pages/SahatMap';
import SahatDetail from './pages/SahatDetail';
import ListDetail from './pages/ListDetail';
import Lists from './pages/Lists';
import SystemMapPage from './pages/SystemMapPage';
import Writings from './pages/Writings';
import BrainDashboard from './pages/BrainDashboard';
import ActivityLogPage from './pages/ActivityLogPage';
import AttentionCenter from './pages/AttentionCenter';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import Notifications from './pages/Notifications';
import ProjectsHub from './pages/ProjectsHub';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DevCenter from './pages/DevCenter';
import Register from './pages/Register';
import Tasks from './pages/Tasks';

const PAGE_COMPONENTS = {
  Dashboard,
  Home,
  AISettings,
  Settings,
  PeopleProfiles,
  PersonProfilePage,
  FinanceHub,
  AssistantHub,
  DataHub,
  LifeFilePage,
  DirectivesPage,
  SelfPortrait,
  IdentityProfile,
  PlacesMap,
  SahatMap,
  SahatDetail,
  ListDetail,
  Lists,
  SystemMapPage,
  Writings,
  BrainDashboard,
  ActivityLogPage,
  AttentionCenter,
  Login,
  AdminUsers,
  Notifications,
  ProjectsHub,
  ProjectDetailPage,
  DevCenter,
  Register,
  Tasks,
};

export default PAGE_COMPONENTS;
