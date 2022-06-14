import React from 'react'

interface Props {
    
}

const Footer = (props: Props) => {
    return (
        <footer className="bg-brand-elementBG p-5 text-brand-black-tertiary h-28">
            <div className=" text-center mx-auto text-sm font-normal flex justify-center items-center h-full">
                <h5 className="leading-loose">Copyright © 2022, Zonlo. All rights reserved. <br className="md:hidden"/> Made in London 🇬🇧</h5>
            </div>
        </footer>
    )
}

export default Footer
