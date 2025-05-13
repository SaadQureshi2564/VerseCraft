// src/components/EditProfile.js

import React from 'react';
import AccountInfo from './AccountInfo';

function EditProfile({ user, setUser }) {
    return (
        <div>
            <AccountInfo user={user} setUser={setUser} />
        </div>
    );
}

export default EditProfile;
