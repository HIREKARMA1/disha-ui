import { apiClient } from '@/lib/api';

export interface SSOResponse {
  redirect_url: string;
  expires_at: string;
  service: string;
}

export interface SSOStatus {
  resume_builder: {
    connected: boolean;
    last_sync: string | null;
    profile_url: string | null;
  };
  sangha: {
    connected: boolean;
    last_sync: string | null;
    profile_url: string | null;
  };
  sadhana: {
    connected: boolean;
    last_sync: string | null;
    profile_url: string | null;
  };
  google: {
    connected: boolean;
    last_sync: string | null;
    profile_url: string | null;
  };
}

class SSOService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generate SSO URL for Sangha (Discourse) integration
   */
  async getSanghaSSOUrl(): Promise<SSOResponse> {
    try {
      console.log('SSOService: Making API call to /sso/sangha');
      console.log('SSOService: Headers:', this.getHeaders());
      
      const response = await apiClient.client.get('/sso/sangha', {
        headers: this.getHeaders()
      });
      
      console.log('SSOService: API response status:', response.status);
      console.log('SSOService: API response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('SSOService: Failed to get Sangha SSO URL:', error);
      if (error.response) {
        console.error('SSOService: Error response:', error.response.data);
        console.error('SSOService: Error status:', error.response.status);
      }
      throw error;
    }
  }

  /**
   * Generate SSO URL for Resume Builder integration
   */
  async getResumeBuilderSSOUrl(): Promise<SSOResponse> {
    try {
      const response = await apiClient.client.get('/sso/resume-builder', {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get Resume Builder SSO URL:', error);
      throw error;
    }
  }

  /**
   * Generate SSO URL for Sadhana (OpenEdx) integration
   */
  async getSadhanaSSOUrl(): Promise<SSOResponse> {
    try {
      const response = await apiClient.client.get('/sso/sadhana', {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get Sadhana SSO URL:', error);
      throw error;
    }
  }

  /**
   * Generate Google OAuth SSO URL
   */
  async getGoogleSSOUrl(): Promise<SSOResponse> {
    try {
      const response = await apiClient.client.get('/sso/google', {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get Google SSO URL:', error);
      throw error;
    }
  }

  /**
   * Get SSO integration status for the current user
   */
  async getSSOStatus(): Promise<SSOStatus> {
    try {
      const response = await apiClient.client.get('/sso/status', {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get SSO status:', error);
      throw error;
    }
  }

  /**
   * Disconnect SSO integration for a specific service
   */
  async disconnectSSO(service: string): Promise<void> {
    try {
      await apiClient.client.post(`/sso/disconnect/${service}`, {}, {
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error(`Failed to disconnect ${service} SSO:`, error);
      throw error;
    }
  }

  /**
   * Redirect to Sangha with SSO
   */
  async redirectToSangha(): Promise<void> {
    try {
      console.log('SSOService: Getting Sangha SSO URL...');
      const ssoData = await this.getSanghaSSOUrl();
      console.log('SSOService: Received SSO data:', ssoData);
      
      if (ssoData.redirect_url) {
        console.log('SSOService: Redirecting to:', ssoData.redirect_url);
        window.location.href = ssoData.redirect_url;
      } else {
        console.error('SSOService: Invalid SSO data received:', ssoData);
        throw new Error('Failed to generate SSO URL');
      }
    } catch (error) {
      console.error('SSOService: Failed to redirect to Sangha:', error);
      throw error;
    }
  }

  /**
   * Redirect to Resume Builder with SSO
   */
  async redirectToResumeBuilder(): Promise<void> {
    try {
      const ssoData = await this.getResumeBuilderSSOUrl();
      if (ssoData.redirect_url) {
        window.location.href = ssoData.redirect_url;
      } else {
        throw new Error('Failed to generate SSO URL');
      }
    } catch (error) {
      console.error('Failed to redirect to Resume Builder:', error);
      throw error;
    }
  }

  /**
   * Redirect to Sadhana with SSO
   */
  async redirectToSadhana(): Promise<void> {
    try {
      const ssoData = await this.getSadhanaSSOUrl();
      if (ssoData.redirect_url) {
        window.location.href = ssoData.redirect_url;
      } else {
        throw new Error('Failed to generate SSO URL');
      }
    } catch (error) {
      console.error('Failed to redirect to Sadhana:', error);
      throw error;
    }
  }
}

export default SSOService;
