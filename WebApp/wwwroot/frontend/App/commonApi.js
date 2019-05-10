import axios from 'axios';

export const fetchEntity = (entity, columns, filters) => {
    return axios.post(`/api/${entity}/`, {columns, filters});
};

export const removeEntity = (entity, id) => {
    return axios.get(`/api/${entity}/remove/${id}`);
};