
package ist.leaves.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider jwtTokenProvider, ObjectMapper objectMapper) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        // Set response type to JSON
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                logger.error("Authentication or principal is null");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "error", "Authentication failed",
                    "message", "No authentication principal found"
                )));
                return;
            }
            
            if (authentication.getPrincipal() instanceof CustomOAuth2User) {
                CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
                String token = jwtTokenProvider.generateToken(oAuth2User);
                Map<String, String> tokenResponse = new HashMap<>();
                tokenResponse.put("token", token);
                response.getWriter().write(objectMapper.writeValueAsString(tokenResponse));
                logger.info("Successfully generated token for user: {}", oAuth2User.getEmail());
            } else {
                logger.warn("Principal is not an instance of CustomOAuth2User: {}", 
                    authentication.getPrincipal().getClass().getName());
                
                // Fallback to standard token generation
                String email = null;
                if (authentication.getName() != null) {
                    email = authentication.getName();
                }
                
                if (email == null) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                        "error", "Authentication failed", 
                        "message", "Could not determine user email"
                    )));
                    return;
                }
                
                String token = jwtTokenProvider.generateToken(email);
                response.getWriter().write(objectMapper.writeValueAsString(Map.of("token", token)));
                logger.info("Generated fallback token for user: {}", email);
            }
        } catch (Exception ex) {
            logger.error("Error in authentication success handler", ex);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "error", "Authentication failed",
                "message", ex.getMessage()
            )));
        }
    }
}
