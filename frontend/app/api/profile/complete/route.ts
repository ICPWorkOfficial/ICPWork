import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { profileId, tab, data } = await request.json();
    
    // Read current profiles
    const filePath = path.join(process.cwd(), 'data', 'profiles.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const profilesData = JSON.parse(fileContent);
    
    // Find the profile to update
    const profileIndex = profilesData.profiles.findIndex((p: any) => p.id === profileId);
    
    if (profileIndex === -1) {
      return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 });
    }
    
    // Update profile based on tab
    const profile = profilesData.profiles[profileIndex];
    
    switch (tab) {
      case 'about':
        profile.personal.name = data.name || profile.personal.name;
        profile.personal.title = data.title || profile.personal.title;
        profile.personal.about = data.about || profile.personal.about;
        break;
        
      case 'social':
        const socials = [];
        if (data.github) socials.push({ platform: 'GitHub', url: data.github, icon: 'github' });
        if (data.linkedin) socials.push({ platform: 'LinkedIn', url: data.linkedin, icon: 'linkedin' });
        if (data.twitter) socials.push({ platform: 'Twitter', url: data.twitter, icon: 'twitter' });
        profile.personal.socials = socials;
        break;
        
      case 'education':
        profile.education = data.education || [];
        break;
        
      case 'work':
        if (data.jobTitle && data.company) {
          profile.workExperience = [{
            id: 1,
            designation: data.jobTitle,
            company: data.company,
            description: data.jobDescription || '',
            duration: 'Present',
            timeWorked: 'Current'
          }];
        }
        break;
        
      case 'others':
        if (data.skillsText) {
          profile.skills = data.skillsText.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (data.portfolio) {
          profile.personal.portfolioUrl = data.portfolio;
        }
        break;
    }
    
    // Check if profile is complete enough to change status
    const isComplete = profile.personal.name && 
                      profile.personal.title && 
                      profile.personal.about && 
                      profile.skills.length > 0;
    
    if (isComplete && profile.status === 'incomplete') {
      profile.status = 'complete';
    }
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(profilesData, null, 2));
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Profile updated successfully',
      status: profile.status 
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}
