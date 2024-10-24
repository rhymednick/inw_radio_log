// File: /components/checked-out-radios-tabs.tsx

'use client';

import React, { useState } from 'react';
import CheckedOutRadios from '@/components/checked-out-radios';
import UsersWithRadios from '@/components/users-with-radios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CheckedOutRadiosTabs: React.FC = () => {
    const [activeView, setActiveView] = useState<string>('radios');

    return (
        <div className="checked-out-radios-tabs m-2">
            <Card className="inline-block p-2 w-[600px]">
                <CardContent>
                    <div className="flex w-full justify-between border bg-slate-100 border-gray-400 rounded-md p-2 space-x-2 mt-2">
                        <Button
                            variant={activeView === 'radios' ? 'outline' : 'secondary'}
                            onClick={() => setActiveView('radios')}
                            className={`w-1/2 ${
                                activeView === 'radios' ? 'bg-slate-300 font-bold' : 'bg-default font-medium'
                            }`}
                        >
                            Checked Out Radios
                        </Button>
                        <Button
                            variant={activeView === 'users' ? 'outline' : 'ghost'}
                            onClick={() => setActiveView('users')}
                            className={`w-1/2 ${
                                activeView === 'users' ? 'bg-slate-300 font-bold' : 'bg-default font-medium'
                            }`}
                        >
                            Users with Radios
                        </Button>
                    </div>

                    <div className="space-y-2 mt-6">
                        {activeView === 'radios' && <CheckedOutRadios />}
                        {activeView === 'users' && <UsersWithRadios />}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckedOutRadiosTabs;
