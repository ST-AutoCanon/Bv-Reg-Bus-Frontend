import { FC } from 'react';
import * as React from "react"
import SearchUser from './searchUser';
import SearchHomologation from './searchHomologation';
const SearchUserOrHomologation: FC = () => {
    
    return (
        <>        
            <SearchUser/>
            <SearchHomologation/>
        </>
    )
}
export default SearchUserOrHomologation;
