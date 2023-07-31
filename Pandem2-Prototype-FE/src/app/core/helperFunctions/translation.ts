/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { AuthManagementDataService } from '../services/auth-management-data.service';

// Retrieve the default language based on user preferences or fallback options
export async function getDefaultLanguage(
  languages: any[],
  authManagementDataService: AuthManagementDataService,
  userBrowserLanguage: string
): Promise<any> {
  const userLanguage = authManagementDataService.getAuthenticatedUser()?.settings?.language;
  if (userLanguage) {
    // If the user has a preferred language, find it in the available languages or fallback options
    const language = languages.find(item => item.country_code === userLanguage && item.enabled);
    if (language !== undefined) {
      return language;
    }
  }

  if (userBrowserLanguage) {
    const language = languages.find(item => item.country_code === userBrowserLanguage.toUpperCase());
    if (language) {
      return language;
    }
  }

  return languages.find(item => item.default_language === true) || getDefaultLanguageFallback(languages);
}

// Find a default language
export function getDefaultLanguageFallback(languages: any[]): any {
  return languages.find(item => item.enabled) || languages[0];
}