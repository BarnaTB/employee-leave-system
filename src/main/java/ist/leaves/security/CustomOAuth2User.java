
package ist.leaves.security;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import ist.leaves.entity.Employee;
import ist.leaves.entity.Role;

public class CustomOAuth2User implements OAuth2User {

    private final Employee employee;
    private final Map<String, Object> attributes;

    public CustomOAuth2User(Employee employee, Map<String, Object> attributes) {
        this.employee = employee;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + employee.getRole().name())
        );
    }

    @Override
    public String getName() {
        return employee.getName();
    }
    
    public String getEmail() {
        return employee.getEmail();
    }
    
    public Long getId() {
        return employee.getId();
    }
    
    public Role getRole() {
        return employee.getRole();
    }
    
    public String getMicrosoftId() {
        return employee.getMicrosoftId();
    }
    
    public Employee getEmployee() {
        return employee;
    }
}
