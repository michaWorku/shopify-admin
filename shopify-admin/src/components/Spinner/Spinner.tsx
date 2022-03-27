import { FC } from "react"
import './spinner.scss'

const Spinner : FC= () => {
    return (
      <div className='loadingSpinnerContainer'>
        <div className='loadingSpinner'></div>
      </div>
    )
}

export default Spinner