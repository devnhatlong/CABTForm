import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

import TableComponent from '../../../components/TableComponent/TableComponent';
import InputComponent from '../../../components/InputComponent/InputComponent';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import userService from '../../../services/userService';
import Loading from '../../../components/LoadingComponent/Loading';
import * as message from '../../../components/Message/Message';
import { useMutationHooks } from '../../../hooks/useMutationHook';
import DrawerComponent from '../../../components/DrawerComponent/DrawerComponent';
import { WrapperContentPopup } from '../../../components/NavbarLoginComponent/style';
import 'moment-timezone';

export const SocialOrder = () => {
    const user = useSelector((state) => state?.user);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });
    const navigate = useNavigate();

    useEffect(() => {
        if(user?.role !== "admin") {
            navigate(`/dashboard`);
        }
    }, [user]);

    return (
        <div>
            
        </div>
    )
}
