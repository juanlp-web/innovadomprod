import { useNavigate, useLocation } from 'react-router-dom'
import { getRouteByTab, getTabByRoute } from '@/config/routes'

export function useNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const getActiveTab = () => {
    return getTabByRoute(location.pathname)
  }

  const navigateToTab = (tab) => {
    const route = getRouteByTab(tab)
    navigate(route)
  }

  const getCurrentPath = () => {
    return location.pathname
  }

  const isActiveTab = (tab) => {
    return getActiveTab() === tab
  }

  return {
    getActiveTab,
    navigateToTab,
    getCurrentPath,
    isActiveTab
  }
}
