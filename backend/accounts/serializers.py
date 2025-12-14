from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


class LoginSerializer(TokenObtainPairSerializer):
    """Serializer for user login with email"""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for customer registration"""

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'role']
        read_only_fields = ['role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=User.Role.CUSTOMER
        )
        return user
