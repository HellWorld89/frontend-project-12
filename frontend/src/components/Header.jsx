import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { logout } from '../store/authSlice'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated } = useSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
      <div className="container">
        <Link className="navbar-brand" to="/">
          {t('common.appName')}
        </Link>

        {isAuthenticated && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogout}
          >
            {t('auth.logout')}
          </button>
        )}
      </div>
    </nav>
  )
}

export default Header
