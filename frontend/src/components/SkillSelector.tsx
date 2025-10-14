import React, { useState, useEffect, useRef, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PREDETERMINED_SKILLS } from '../constants/skills';

interface SkillSelectorProps {
    selectedSkills: string[];
    onChange: (skills: string[]) => void;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({ selectedSkills, onChange }) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter skills based on query and exclude already selected skills
    const filteredSkills = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        return PREDETERMINED_SKILLS.filter(
            skill =>
                skill.toLowerCase().includes(lowerQuery) &&
                !selectedSkills.includes(skill)
        );
    }, [query, selectedSkills]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelectSkill = (skillName: string) => {
        if (!selectedSkills.includes(skillName)) {
            onChange([...selectedSkills, skillName]);
        }
        setQuery('');
        setShowSuggestions(false);
    };

    const handleRemoveSkill = (skillName: string) => {
        onChange(selectedSkills.filter(s => s !== skillName));
    };

    return (
        <div className="w-full" ref={wrapperRef}>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedSkills.map(skill => (
                    <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

            <div className="relative">
                <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Search skills..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                    />
                </div>

                {showSuggestions && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredSkills.length === 0 ? (
                            <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                                {query ? 'No skills found matching your search.' : 'All skills have been selected.'}
                            </li>
                        ) : (
                            filteredSkills.map((skill) => (
                                <li
                                    key={skill}
                                    className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleSelectSkill(skill)}
                                >
                                    <span className="block truncate font-normal">
                                        {skill}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SkillSelector;
