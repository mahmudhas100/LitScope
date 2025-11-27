import NotificationPanel from '../notifications/NotificationPanel'

const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
      <div className="flex justify-between items-center h-16 px-6">
        <div className="flex-1" />
        <img
          src="/logo.png"
          alt="LitScope Logo"
          className="h-12 object-contain"
        />
        <div className="flex-1 flex justify-end">
          <NotificationPanel />
        </div>
      </div>
    </div>
  )
}

export default Navbar