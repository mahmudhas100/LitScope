const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
      <div className="flex justify-center items-center h-16">
        <img 
          src="/logo.png"
          alt="LitScope Logo" 
          className="h-12 object-contain"
        />
      </div>
    </div>
  )
}

export default Navbar