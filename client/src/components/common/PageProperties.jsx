import React from 'react';
import { TagInput } from './Tag';
import StatusBadge from './StatusBadge';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PageProperties = ({ page, onUpdate }) => {
    const handleTagsChange = async (newTags) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/pages/${page._id}`,
                { properties: { tags: newTags } },
                { withCredentials: true }
            );
            onUpdate(response.data);
        } catch (error) {
            console.error('Failed to update tags', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/pages/${page._id}`,
                { properties: { status: newStatus } },
                { withCredentials: true }
            );
            onUpdate(response.data);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    if (!page) return null;

    return (
        <div className="flex items-center gap-3 px-6 py-2 border-b border-border/40">
            <StatusBadge
                status={page.properties?.status || 'Not Started'}
                onChange={handleStatusChange}
            />

            <div className="h-4 w-px bg-border" />

            <TagInput
                tags={page.properties?.tags || []}
                onTagsChange={handleTagsChange}
            />
        </div>
    );
};

export default PageProperties;
