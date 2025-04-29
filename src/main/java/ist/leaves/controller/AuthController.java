
package ist.leaves.controller;

import java.util.HashMap;
import java.util.Map;

import ist.leaves.security.CustomOAuth2User;
import ist.leaves.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ist.leaves.entity.Employee;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken(@AuthenticationPrincipal OAuth2User principal) {
        logger.info("Token requested by user: {}", principal.getName());
        
        Map<String, String> response = new HashMap<>();
        String token;
        
        if (principal instanceof CustomOAuth2User) {
            CustomOAuth2User customOAuth2User = (CustomOAuth2User) principal;
            token = jwtTokenProvider.generateToken(customOAuth2User);
            logger.info("Generated token for CustomOAuth2User: {}", customOAuth2User.getEmail());
        } else {
            // Fallback for standard OAuth2User
            String email = principal.getAttribute("email");
            if (email == null) {
                email = principal.getAttribute("preferred_username");
            }
            if (email == null) {
                email = principal.getName();
            }
            token = jwtTokenProvider.generateToken(email);
            logger.info("Generated token for standard OAuth2User: {}", email);
        }
        
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
            
        Employee employee = customOAuth2User.getEmployee();
        
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("id", employee.getId());
        userDetails.put("name", employee.getName());
        userDetails.put("email", employee.getEmail());
        userDetails.put("avatarUrl", employee.getAvatarUrl());
        userDetails.put("role", employee.getRole().name());
        
        return ResponseEntity.ok(userDetails);
    }
}
