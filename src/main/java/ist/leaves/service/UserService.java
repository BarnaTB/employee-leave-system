
package ist.leaves.service;

import java.util.Map;
import java.util.Optional;

import ist.leaves.security.CustomOAuth2User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import ist.leaves.entity.Employee;
import ist.leaves.entity.Role;
import ist.leaves.exception.OAuth2AuthenticationProcessingException;
import ist.leaves.repository.EmployeeRepository;

@Service
public class UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final EmployeeRepository employeeRepository;
    private final Environment environment;

    public UserService(EmployeeRepository employeeRepository,
                       Environment environment) {
        this.employeeRepository = employeeRepository;
        this.environment = environment;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        logger.debug("OAuth2User attributes: {}", oAuth2User.getAttributes());
        
        try {
            return processOAuth2User(userRequest, oAuth2User.getAttributes());
        } catch (Exception ex) {
            logger.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationProcessingException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest,
                                         Map<String, Object> attributes) {
        // Extract email from Microsoft attributes
        String email = extractEmail(attributes);
        String microsoftId = extractMicrosoftId(attributes);
        String name = extractName(attributes);
        String avatarUrl = extractPicture(attributes);

        logger.info("Processing OAuth2 login for email: {}", email);
        
        // Validate email
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        // Check domain if in production
        if (shouldValidateDomain() && !email.endsWith("@ist.com")) {
            throw new OAuth2AuthenticationProcessingException("Invalid email domain");
        }
        
        // Try to find user by email or Microsoft ID
        Optional<Employee> userByEmail = employeeRepository.findByEmail(email);
        Optional<Employee> userByMicrosoftId = Optional.empty();
        
        if (microsoftId != null && !microsoftId.isEmpty()) {
            userByMicrosoftId = employeeRepository.findByMicrosoftId(microsoftId);
        }

        Employee employee;
        
        // If user exists by email or Microsoft ID, update them
        if (userByEmail.isPresent()) {
            employee = userByEmail.get();
            updateExistingUser(employee, microsoftId, name, avatarUrl);
        } else if (userByMicrosoftId.isPresent()) {
            employee = userByMicrosoftId.get();
            // Update email if it changed
            if (!email.equals(employee.getEmail())) {
                employee.setEmail(email);
            }
            updateExistingUser(employee, microsoftId, name, avatarUrl);
        } else {
            // Register new user
            employee = registerNewUser(microsoftId, email, name, avatarUrl);
        }
        
        return new CustomOAuth2User(employee, attributes);
    }

    private Employee registerNewUser(String microsoftId, String email, String name, String avatarUrl) {
        logger.info("Registering new user with email: {}", email);
        
        Employee employee = new Employee();
        employee.setMicrosoftId(microsoftId);
        employee.setEmail(email);
        employee.setName(name);
        employee.setAvatarUrl(avatarUrl);
        employee.setRole(Role.USER);
        employee.setActive(true);
        employee.setLeaveBalance(0.0); // Default leave balance
        
        return employeeRepository.save(employee);
    }
    
    private void updateExistingUser(Employee employee, String microsoftId, String name, String avatarUrl) {
        logger.info("Updating existing user: {}", employee.getEmail());
        
        // Update Microsoft ID if needed
        if (microsoftId != null && !microsoftId.equals(employee.getMicrosoftId())) {
            employee.setMicrosoftId(microsoftId);
        }
        
        // Update name if needed
        if (name != null && !name.equals(employee.getName())) {
            employee.setName(name);
        }
        
        // Update avatar if needed
        if (avatarUrl != null && !avatarUrl.equals(employee.getAvatarUrl())) {
            employee.setAvatarUrl(avatarUrl);
        }
        
        employeeRepository.save(employee);
    }
    
    private boolean shouldValidateDomain() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("prod".equals(profile)) {
                return true;
            }
        }
        return false;
    }
    
    // Helper methods to extract Microsoft user info
    private String extractEmail(Map<String, Object> attributes) {
        if (attributes.containsKey("email")) {
            return (String) attributes.get("email");
        } else if (attributes.containsKey("userPrincipalName")) {
            return (String) attributes.get("userPrincipalName");
        } else if (attributes.containsKey("preferred_username")) {
            return (String) attributes.get("preferred_username");
        }
        return null;
    }
    
    private String extractMicrosoftId(Map<String, Object> attributes) {
        if (attributes.containsKey("sub")) {
            return (String) attributes.get("sub");
        } else if (attributes.containsKey("oid")) {
            return (String) attributes.get("oid");
        }
        return null;
    }
    
    private String extractName(Map<String, Object> attributes) {
        if (attributes.containsKey("name")) {
            return (String) attributes.get("name");
        } else if (attributes.containsKey("displayName")) {
            return (String) attributes.get("displayName");
        }
        return null;
    }
    
    private String extractPicture(Map<String, Object> attributes) {
        if (attributes.containsKey("picture")) {
            return (String) attributes.get("picture");
        }
        return null;
    }
}
