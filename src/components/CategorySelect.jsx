import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { getCategories } from '../services/eventService';

const CategorySelect = ({ value, onChange }) => {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    return (
        <Select 
            placeholder="Chọn danh mục" 
            value={value} 
            onChange={onChange}
        >
            {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>
                    {cat.tenDanhMuc}
                </Select.Option>
            ))}
        </Select>
    );
};
export default CategorySelect;