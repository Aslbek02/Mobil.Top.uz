// profile.js - Profil uchun JavaScript funksiyalari

// Mahsulotlar bazasidan ma'lumot olish
function getProductById(productId) {
    const allProducts = [];
    
    // Barcha kategoriyalardagi mahsulotlarni birlashtiramiz
    Object.values(window.productsDatabase).forEach(category => {
        allProducts.push(...category);
    });
    
    return allProducts.find(product => product.id === productId);
}

// Profil ma'lumotlarini yangilash
function updateUserProfile(updates) {
    let userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    userProfile = {...userProfile, ...updates};
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    return userProfile;
}

// Buyurtma yaratish
function createOrder(cartItems, userInfo) {
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + 
                   Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        status: 'pending',
        items: cartItems,
        userInfo: userInfo,
        total: calculateTotal(cartItems),
        paymentMethod: 'cash_on_delivery',
        deliveryAddress: userInfo.address || 'Aniqlanmagan'
    };
    
    // Buyurtmalar ro'yxatiga qo'shish
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    orders.unshift(order);
    localStorage.setItem('userOrders', JSON.stringify(orders));
    
    return order;
}

// Jami summni hisoblash
function calculateTotal(items) {
    return items.reduce((total, item) => {
        const product = getProductById(item.id);
        return total + (product ? product.price * item.quantity : 0);
    }, 0);
}

// Profil statistikasini olish
function getProfileStats(userId) {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const wishlistCount = wishlist.length;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
        totalOrders,
        totalSpent,
        wishlistCount,
        cartCount,
        orderHistory: orders
    };
}

// Mahsulotni taqqoslash
function addToComparison(productId) {
    const comparison = JSON.parse(localStorage.getItem('comparison') || '[]');
    
    if (!comparison.includes(productId)) {
        if (comparison.length >= 4) {
            alert('Maksimum 4 ta mahsulotni taqqoslash mumkin!');
            return false;
        }
        comparison.push(productId);
        localStorage.setItem('comparison', JSON.stringify(comparison));
        return true;
    }
    
    return false;
}

// SMS xabarnoma yuborish
function sendSMSNotification(phone, message) {
    // Bu yerda SMS yuborish API chaqiruvi bo'lishi kerak
    console.log(`SMS sent to ${phone}: ${message}`);
    
    // O'zgaruvchilarni localStorage ga saqlash
    const notifications = JSON.parse(localStorage.getItem('smsNotifications') || '[]');
    notifications.push({
        phone,
        message,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('smsNotifications', JSON.stringify(notifications));
}

// Mahsulotni ko'rish tarixi
function addToViewHistory(productId) {
    const viewHistory = JSON.parse(localStorage.getItem('viewHistory') || '[]');
    
    // Eskilarini olib tashlash
    const index = viewHistory.indexOf(productId);
    if (index > -1) {
        viewHistory.splice(index, 1);
    }
    
    // Yangisini boshiga qo'shish
    viewHistory.unshift(productId);
    
    // Faqat oxirgi 20 tasini saqlash
    if (viewHistory.length > 20) {
        viewHistory.pop();
    }
    
    localStorage.setItem('viewHistory', JSON.stringify(viewHistory));
}

// Profil rasmini yuklash
function uploadProfileImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('Fayl tanlanmagan');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Rasmni localStorage ga saqlash
            localStorage.setItem('profileImage', imageData);
            
            // Profil ma'lumotlarini yangilash
            const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            userProfile.profileImage = imageData;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            resolve(imageData);
        };
        
        reader.onerror = function() {
            reject('Rasm yuklashda xato');
        };
        
        reader.readAsDataURL(file);
    });
}

// Profilni eksport qilish
function exportProfileData() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const exportData = {
        profile: userProfile,
        orders: orders,
        wishlist: wishlist,
        cart: cart,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    return dataBlob;
}

// Profilni import qilish
function importProfileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Ma'lumotlarni tekshirish
                if (!data.profile || !data.orders || !data.wishlist || !data.cart) {
                    reject('Noto\'g\'ri fayl formati');
                    return;
                }
                
                // Ma'lumotlarni localStorage ga saqlash
                localStorage.setItem('userProfile', JSON.stringify(data.profile));
                localStorage.setItem('userOrders', JSON.stringify(data.orders));
                localStorage.setItem('wishlist', JSON.stringify(data.wishlist));
                localStorage.setItem('cart', JSON.stringify(data.cart));
                
                resolve('Profil ma\'lumotlari muvaffaqiyatli yuklandi');
            } catch (error) {
                reject('Faylni o\'qishda xato: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            reject('Faylni yuklashda xato');
        };
        
        reader.readAsText(file);
    });
}